import { useState, useEffect } from 'react';
import * as Y from 'yjs';

/**
 * Hook to observe a Y.Text and get its plaintext content as a string
 */
export const useYText = (yText: Y.Text | undefined): string => {
  const [content, setContent] = useState(() => yText?.toString() || '');
  
  useEffect(() => {
    if (!yText) {
      setContent('');
      return;
    }
    
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

