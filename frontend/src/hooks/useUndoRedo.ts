import { useEffect } from 'react';
import { itemStore } from '../store/ItemStore';

export const useUndoRedo = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger undo/redo if typing in an input/textarea or Quill editor
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('.ql-editor')
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd+Z (without Shift)
      if (modifierKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        itemStore.undo();
      }
      // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      else if (
        (modifierKey && e.key === 'z' && e.shiftKey) ||
        (modifierKey && e.key === 'y')
      ) {
        e.preventDefault();
        itemStore.redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

