import { useEffect, useRef } from 'react';
import Quill from 'quill';
import { QuillBinding } from 'y-quill';
import * as Y from 'yjs';
import styled from 'styled-components';
import { useIsInViewport } from '../hooks/useIsInViewport';
import 'quill/dist/quill.snow.css';

const EditorContainer = styled.div`
  width: 100%;
  height: 100%;
  cursor: text;

  .ql-container {
    border: none;
    font-size: 14px;
    font-family: inherit;
  }

  .ql-editor {
    padding: 0;
    min-height: 30px;
    cursor: text;
  }

  .ql-editor.ql-blank::before {
    font-style: normal;
    color: #999;
    left: 0;
  }

  .ql-editor p {
    margin: 0;
  }
`;

interface QuillEditorProps {
  yText: Y.Text;
}

export const QuillEditor = ({ yText }: QuillEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const bindingRef = useRef<QuillBinding | null>(null);
  const isInViewport = useIsInViewport(containerRef);

  // Initialize Quill only when in viewport
  useEffect(() => {
    if (!containerRef.current || !isInViewport || quillRef.current) return;

    // Initialize Quill
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
  }, [yText, isInViewport]);

  return <EditorContainer ref={containerRef} />;
};

