import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { CanvasItem } from '../types';

type ItemChangeListener = () => void;
type ItemsChangeListener = () => void;

class ItemStore {
  private ydoc: Y.Doc;
  private yItems: Y.Map<Y.Map<any>>;
  private provider: HocuspocusProvider | null = null;
  private undoManager: Y.UndoManager;
  private workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
    this.ydoc = new Y.Doc();
    this.yItems = this.ydoc.getMap<Y.Map<any>>('items');
    
    this.loadFromStorage();
    
    // Initialize UndoManager to track changes to yItems (including nested changes)
    this.undoManager = new Y.UndoManager(this.yItems);

    this.setupPersistence();
    this.setupProvider();
  }
  
  private setupProvider() {
    // Connect to HocusPocus server with workspace-specific room
    this.provider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: `workspace-${this.workspaceId}`,
      document: this.ydoc,
      onStatus: (event: any) => {
        console.log('Connection status:', event.status);
      },
    });
  }

  private getStorageKey(): string {
    return `newboard-workspace-${this.workspaceId}-v3`;
  }

  private loadFromStorage() {
    const STORAGE_KEY = this.getStorageKey();
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
    const STORAGE_KEY = this.getStorageKey();
    this.ydoc.on('update', () => {
      const update = Y.encodeStateAsUpdate(this.ydoc);
      const updateArray = Array.from(update);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updateArray));
    });
  }

  private yMapToItem(ymap: Y.Map<any>): CanvasItem {
    const type = ymap.get('type');
    const id = ymap.get('id');
    const position = {
      x: ymap.get('x') || 0,
      y: ymap.get('y') || 0,
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
    ymap.set('x', item.position.x);
    ymap.set('y', item.position.y);
    
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

  getAwareness() {
    return this.provider?.awareness || null;
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
          ymap.set('x', (ymap.get('x') || 0) + deltaX);
          ymap.set('y', (ymap.get('y') || 0) + deltaY);
        }
      });
    });
  }

  deleteItems(itemIds: string[]): void {
    this.ydoc.transact(() => {
      itemIds.forEach(id => {
        this.yItems.delete(id);
      });
    });
  }

  // Undo/Redo API
  undo(): void {
    this.undoManager.undo();
  }

  redo(): void {
    this.undoManager.redo();
  }

  canUndo(): boolean {
    return this.undoManager.canUndo();
  }

  canRedo(): boolean {
    return this.undoManager.canRedo();
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

// Workspace-specific instances
const itemStores = new Map<string, ItemStore>();

export function getItemStore(workspaceId: string): ItemStore {
  if (!itemStores.has(workspaceId)) {
    itemStores.set(workspaceId, new ItemStore(workspaceId));
  }
  return itemStores.get(workspaceId)!;
}

export type { ItemStore };

