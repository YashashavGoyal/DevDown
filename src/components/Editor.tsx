import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isDark?: boolean;
  onEditorCreate?: (view: EditorView) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, onScroll, containerRef, isDark, onEditorCreate }) => {
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
          })
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
