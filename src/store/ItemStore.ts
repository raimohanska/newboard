import * as Y from 'yjs';
import { CanvasItem } from '../types';

type ItemChangeListener = () => void;
type ItemsChangeListener = () => void;

class ItemStore {
  private ydoc: Y.Doc;
  private yItems: Y.Map<Y.Map<any>>;

  constructor() {
    this.ydoc = new Y.Doc();
    this.yItems = this.ydoc.getMap<Y.Map<any>>('items');

    this.loadFromStorage();
    this.setupPersistence();
  }

  private loadFromStorage() {
    const STORAGE_KEY = 'newboard-yjs-v2';
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const update = Uint8Array.from(JSON.parse(storedData));
        Y.applyUpdate(this.ydoc, update);
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  private setupPersistence() {
    const STORAGE_KEY = 'newboard-yjs-v2';
    this.ydoc.on('update', () => {
      const update = Y.encodeStateAsUpdate(this.ydoc);
      const updateArray = Array.from(update);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updateArray));
    });
  }

  private yMapToItem(ymap: Y.Map<any>): CanvasItem {
    const type = ymap.get('type');
    const id = ymap.get('id');
    const posMap = ymap.get('position') as Y.Map<number>;
    const position = {
      x: posMap.get('x') || 0,
      y: posMap.get('y') || 0,
    };
    
    if (type === 'Note') {
      let yText = ymap.get('content') as Y.Text;
      
      // Ensure Y.Text exists
      if (!yText || !(yText instanceof Y.Text)) {
        yText = new Y.Text();
        ymap.set('content', yText);
      }
      
      return {
        id,
        type,
        position,
        content: yText,
      };
    }
    
    throw new Error(`Unknown item type: ${type}`);
  }

  private itemToYMap(item: CanvasItem): Y.Map<any> {
    const ymap = new Y.Map();
    ymap.set('id', item.id);
    ymap.set('type', item.type);
    
    const posMap = new Y.Map();
    posMap.set('x', item.position.x);
    posMap.set('y', item.position.y);
    ymap.set('position', posMap);
    
    if (item.type === 'Note') {
      // Item already has Y.Text reference
      ymap.set('content', item.content);
    }
    
    return ymap;
  }

  // Public API
  getItemIds(): string[] {
    return Array.from(this.yItems.keys());
  }

  getItem(itemId: string): CanvasItem | undefined {
    const ymap = this.yItems.get(itemId);
    return ymap ? this.yMapToItem(ymap) : undefined;
  }

  createItem(item: CanvasItem): void {
    const ymap = this.itemToYMap(item);
    this.yItems.set(item.id, ymap);
  }

  bulkCreateItems(items: CanvasItem[]): void {
    this.ydoc.transact(() => {
      items.forEach(item => {
        const ymap = this.itemToYMap(item);
        this.yItems.set(item.id, ymap);
      });
    });
  }


  updateItemPositions(itemIds: string[], deltaX: number, deltaY: number): void {
    this.ydoc.transact(() => {
      itemIds.forEach(id => {
        const ymap = this.yItems.get(id);
        if (ymap) {
          const posMap = ymap.get('position') as Y.Map<number>;
          if (posMap) {
            posMap.set('x', (posMap.get('x') || 0) + deltaX);
            posMap.set('y', (posMap.get('y') || 0) + deltaY);
          }
        }
      });
    });
  }

  deleteItem(itemId: string): void {
    this.yItems.delete(itemId);
  }

  // Subscription API for React hooks
  subscribeToItemIds(listener: ItemsChangeListener): () => void {
    this.yItems.observe(listener);
    return () => {
      this.yItems.unobserve(listener);
    };
  }

  subscribeToItem(itemId: string, listener: ItemChangeListener): () => void {
    const ymap = this.yItems.get(itemId);
    if (!ymap) return () => {};

    // Shallow observe - only position changes, not content Y.Text
    ymap.observe(listener);
    
    const itemsObserver = () => {
      // Notify if item was removed
      if (!this.yItems.has(itemId)) {
        listener();
      }
    };
    this.yItems.observe(itemsObserver);

    return () => {
      ymap.unobserve(listener);
      this.yItems.unobserve(itemsObserver);
    };
  }
}

// Singleton instance
export const itemStore = new ItemStore();

