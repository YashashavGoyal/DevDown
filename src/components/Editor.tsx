import React, { useCallback } from 'react';
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
}

const Editor: React.FC<EditorProps> = ({ value, onChange, onScroll, containerRef, isDark, onEditorCreate, onAction }) => {
  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  return (
    <div 
      ref={containerRef as any}
      className="h-full w-full overflow-hidden"
      onScroll={onScroll}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={isDark ? 'dark' : 'light'}
        onCreateEditor={onEditorCreate}
        extensions={[
          markdown({ codeLanguages: languages }),
          EditorView.lineWrapping,
          EditorView.theme({
            "&": {
              height: "100%",
              backgroundColor: "transparent !important",
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
            }
          }),
          keymap.of([
            { key: "Mod-b", run: () => { onAction?.('bold'); return true; } },
            { key: "Mod-i", run: () => { onAction?.('italic'); return true; } },
            { key: "Mod-k", run: () => { onAction?.('link'); return true; } },
            { key: "Mod-Shift-k", run: () => { onAction?.('code'); return true; } },
            { key: "Mod-q", run: () => { onAction?.('quote'); return true; } },
          ])
        ]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
        }}
        className="h-full outline-none"
      />
    </div>
  );
};

export default Editor;
