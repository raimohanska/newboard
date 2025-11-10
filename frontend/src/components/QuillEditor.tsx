import { useEffect, useRef } from 'react';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { QuillBinding } from 'y-quill';
import * as Y from 'yjs';
import styled from 'styled-components';
import { useWorkspace } from '../contexts/WorkspaceContext';
import 'quill/dist/quill.snow.css';

Quill.register('modules/cursors', QuillCursors);

const EditorContainer = styled.div`
  width: 100%;
  cursor: text;
  height: initial;
  border: none !important;

  .ql-editor {
    padding: 8px 0;
    min-height: 30px;
    cursor: text;
    position: relative;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .ql-editor p {
    margin: 0;
  }
`;

interface QuillEditorProps {
  yText: Y.Text;
  noteId: string;
}

export const QuillEditor = ({ yText }: QuillEditorProps) => {
  const { itemStore } = useWorkspace();
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const bindingRef = useRef<QuillBinding | null>(null);

  // Initialize Quill
  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      modules: {
        toolbar: false,
        cursors: true,
      },
      placeholder: 'Type here...',
      theme: 'snow',
    });

    quillRef.current = quill;

    // Bind Y.Text to Quill with awareness for collaborative cursors
    const awareness = itemStore.getAwareness();
    bindingRef.current = new QuillBinding(yText, quill, awareness || undefined);

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      quillRef.current = null;
    };
  }, [yText, itemStore]);

  return <EditorContainer ref={containerRef} />;
};

