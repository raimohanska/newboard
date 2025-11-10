import * as Y from 'yjs';
import { CanvasItem } from '../types';

// Create Y.js document
export const ydoc = new Y.Doc();

// Shared types - each item is a Y.Map
export const yItems = ydoc.getMap<Y.Map<any>>('items');

// Helper to convert Y.Map item to plain object
export const yMapToItem = (ymap: Y.Map<any>): CanvasItem => {
  const type = ymap.get('type');
  const id = ymap.get('id');
  const posMap = ymap.get('position') as Y.Map<number>;
  const position = {
    x: posMap.get('x') || 0,
    y: posMap.get('y') || 0,
  };
  
  if (type === 'Note') {
    return {
      id,
      type,
      position,
      content: ymap.get('content') || '',
    };
  }
  
  throw new Error(`Unknown item type: ${type}`);
};

// Helper to convert Y.Map to plain object
export const getItemsObject = (): Record<string, CanvasItem> => {
  const items: Record<string, CanvasItem> = {};
  yItems.forEach((ymap, key) => {
    items[key] = yMapToItem(ymap);
  });
  return items;
};

// Helper to create Y.Map from CanvasItem
export const itemToYMap = (item: CanvasItem): Y.Map<any> => {
  const ymap = new Y.Map();
  ymap.set('id', item.id);
  ymap.set('type', item.type);
  
  const posMap = new Y.Map();
  posMap.set('x', item.position.x);
  posMap.set('y', item.position.y);
  ymap.set('position', posMap);
  
  if (item.type === 'Note') {
    ymap.set('content', item.content);
  }
  
  return ymap;
};

// Load from localStorage on init
const STORAGE_KEY = 'newboard-yjs-v2'; // Changed key to invalidate old format
const storedData = localStorage.getItem(STORAGE_KEY);
if (storedData) {
  try {
    const update = Uint8Array.from(JSON.parse(storedData));
    Y.applyUpdate(ydoc, update);
  } catch (error) {
    console.error('Failed to load Y.js doc from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Clean up old storage key
localStorage.removeItem('newboard-yjs');
localStorage.removeItem('newboard-workspace');

// Save to localStorage on changes
ydoc.on('update', () => {
  const update = Y.encodeStateAsUpdate(ydoc);
  const updateArray = Array.from(update);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updateArray));
});

