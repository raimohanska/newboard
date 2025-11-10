import { useState, useEffect } from 'react';
import * as Y from 'yjs';

export const useNoteText = (yText: Y.Text | undefined): string => {
  const [content, setContent] = useState(() => yText?.toString() || '');
  
  useEffect(() => {
    if (!yText) return;
    
    // Initialize content from Y.Text
    setContent(yText.toString());
    
    // Observe Y.Text changes
    const observer = () => {
      setContent(yText.toString());
    };
    
    yText.observe(observer);
    
    return () => {
      yText.unobserve(observer);
    };
  }, [yText]);
  
  return content;
};

