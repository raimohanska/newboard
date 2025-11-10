import { useEffect, useRef } from 'react';
import Quill from 'quill';
import { QuillBinding } from 'y-quill';
import * as Y from 'yjs';
import styled from 'styled-components';
import 'quill/dist/quill.snow.css';

const EditorContainer = styled.div`
  width: 100%;
  cursor: text;
  height: initial;
  border: none !important;

  .ql-editor {
    padding: 0;
    min-height: 30px;
    cursor: text;
  }
`;

interface QuillEditorProps {
  yText: Y.Text;
}

export const QuillEditor = ({ yText }: QuillEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const bindingRef = useRef<QuillBinding | null>(null);

  // Initialize Quill
  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      modules: {
        toolbar: false,
      },
      placeholder: 'Type here...',
      theme: 'snow',
    });

    quillRef.current = quill;

    // Bind Y.Text to Quill
    bindingRef.current = new QuillBinding(yText, quill);

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      quillRef.current = null;
    };
  }, [yText]);

  return <EditorContainer ref={containerRef} />;
};

