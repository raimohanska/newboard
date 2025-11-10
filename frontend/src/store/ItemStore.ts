import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { CanvasItem } from '../types';
import { Awareness } from 'y-quill';

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
    
    // Initialize UndoManager to track changes to yItems (including nested changes)
    this.undoManager = new Y.UndoManager(this.yItems);

    this.setupPersistence();
    this.setupProvider();
  }
  
  private setupProvider() {
    // Derive WebSocket URL from document location
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port;
    const wsUrl = wsPort 
      ? `${wsProtocol}//${wsHost}:${1234}`
      : `${wsProtocol}//${wsHost}`;

    // Connect to HocusPocus server with workspace-specific room
    this.provider = new HocuspocusProvider({
      url: wsUrl,
      name: `workspace-${this.workspaceId}`,
      document: this.ydoc,
      onStatus: (event: any) => {
        console.log('Connection status:', event.status);
      },
    });

    // Set initial user info for collaborative features
    if (this.provider.awareness) {
      this.provider.awareness.setLocalStateField('user', {
        name: this.getRandomName(),
        color: this.getRandomColor(),
      });
    }
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomName(): string {
    const adjectives = ['Happy', 'Clever', 'Bright', 'Swift', 'Bold', 'Kind'];
    const animals = ['Panda', 'Fox', 'Owl', 'Eagle', 'Tiger', 'Dolphin'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
  }

  private setupPersistence() {
    // Use IndexedDB for local persistence
    const dbName = `newboard-workspace-${this.workspaceId}`;
    new IndexeddbPersistence(dbName, this.ydoc);
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

  getAwareness(): Awareness | null {
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

