import React, { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView, keymap } from '@codemirror/view';
import { type MarkdownAction } from './Toolbar';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isDark?: boolean;
  onEditorCreate?: (view: EditorView) => void;
  onAction?: (action: MarkdownAction) => void;
  fontSize: number;
  lineNumbers: boolean;
  lineWrapping: boolean;
}

import { cn } from '../lib/utils';

const Editor: React.FC<EditorProps> = ({ 
  value, onChange, onScroll, containerRef, 
  isDark, onEditorCreate, onAction,
  fontSize, lineNumbers, lineWrapping
}) => {
  const extensions = useMemo(() => {
    const list = [
      markdown({ codeLanguages: languages }),
      EditorView.theme({
        "&": {
          height: "100%",
          backgroundColor: "transparent !important",
          fontSize: `${fontSize}px`,
        },
        ".cm-scroller": {
          overflow: "auto",
          backgroundColor: "transparent !important",
          padding: "2rem",
        },
        ".cm-content": {
          padding: "0",
        },
        ".cm-gutters": {
          backgroundColor: "transparent !important",
          border: "none",
          color: "hsl(var(--muted-foreground))",
          opacity: 0.5,
          display: lineNumbers ? "flex" : "none",
        }
      }),
      keymap.of([
        { key: "Mod-b", run: () => { onAction?.('bold'); return true; } },
        { key: "Mod-i", run: () => { onAction?.('italic'); return true; } },
        { key: "Mod-k", run: () => { onAction?.('link'); return true; } },
        { key: "Mod-Shift-k", run: () => { onAction?.('code'); return true; } },
        { key: "Mod-q", run: () => { onAction?.('quote'); return true; } },
      ])
    ];

    if (lineWrapping) list.push(EditorView.lineWrapping);
    
    return list;
  }, [onAction, fontSize, lineNumbers, lineWrapping]);

  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  return (
    <div 
      ref={containerRef}
      className={cn("h-full w-full overflow-hidden")}
      onScroll={onScroll}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={isDark ? 'dark' : 'light'}
        onCreateEditor={onEditorCreate}
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: lineNumbers,
          foldGutter: lineNumbers,
          highlightActiveLine: true,
          autocompletion: true,
        }}
        className="h-full outline-none"
      />
    </div>
  );
};

export default Editor;
