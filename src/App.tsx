import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor, PanelsTopLeft, Eye, Edit3, SquareCode, Share2 } from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_MARKDOWN = `# Welcome to DevDown 🚀

DevDown is a premium, GitHub-standard Markdown editor.

## Features
- **Split-screen** real-time preview
- **Sync Scrolling** between editor and preview
- **Mermaid Support** for diagrams
- **GitHub Flavored Markdown** (GFM)
- **Responsive Design** for all devices

### Mermaid Example
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Check Syntax]
\`\`\`

#### Task List
- [x] Create the project
- [x] Style it with Tailwind
- [/] Add Mermaid support
- [ ] Share with friends

| Feature | Support |
| :--- | :--- |
| GFM | Yes |
| Mermaid | Yes |
| Sync Scroll | Yes |

---
Enjoy editing!
`;

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'view'>('split');
  const [mounted, setMounted] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<string | null>(null);

  // Handle mounting for hydration-safe theme logic
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
  }, []);

  // Theme application logic
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && mediaQuery.matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme, mounted]);

  // Handle mobile view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (viewMode === 'split') setViewMode('edit');
      } else {
        setViewMode('split');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Sync scrolling logic
  const handleScroll = useCallback((source: 'editor' | 'preview') => {
    if (isScrolling.current && isScrolling.current !== source) return;
    
    isScrolling.current = source;
    
    const sourceEl = source === 'editor' ? editorContainerRef.current : previewContainerRef.current;
    const targetEl = source === 'editor' ? previewContainerRef.current : editorContainerRef.current;

    if (sourceEl && targetEl) {
      const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
      targetEl.scrollTop = percentage * (targetEl.scrollHeight - targetEl.clientHeight);
    }

    // Reset indicator after a short delay
    setTimeout(() => {
      isScrolling.current = null;
    }, 50);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-background transition-colors duration-500 overflow-hidden text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <SquareCode className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            DevDown
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Toggles */}
          <div className="md:hidden flex items-center bg-muted p-1 rounded-lg mr-2">
            <button
              onClick={() => setViewMode('edit')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'edit' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('view')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'view' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "p-2 rounded-md transition-all",
                theme === 'light' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
              title="Light Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "p-2 rounded-md transition-all",
                theme === 'dark' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
              title="Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                "p-2 rounded-md transition-all",
                theme === 'system' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
              title="System Default"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <button className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ml-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Editor Side */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "h-full border-r border-border transition-all duration-300",
                viewMode === 'split' ? "w-1/2" : "w-full"
              )}
            >
              <Editor 
                value={markdown} 
                onChange={setMarkdown} 
                onScroll={() => handleScroll('editor')}
                containerRef={editorContainerRef}
                isDark={document.documentElement.classList.contains('dark')}
              />
            </motion.div>
          )}

          {/* Preview Side */}
          {(viewMode === 'split' || viewMode === 'view') && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "h-full transition-all duration-300",
                viewMode === 'split' ? "w-1/2" : "w-full"
              )}
            >
              <Preview 
                value={markdown} 
                containerRef={previewContainerRef}
                onScroll={() => handleScroll('preview')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Indicator for Split Mode */}
        {viewMode === 'split' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-20">
            <PanelsTopLeft className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="px-4 py-2 border-t border-border bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between items-center">
        <div className="flex gap-4">
          <span>Words: {markdown.split(/\s+/).filter(Boolean).length}</span>
          <span>Characters: {markdown.length}</span>
        </div>
        <div className="flex gap-4">
          <span>UTF-8</span>
          <span>Markdown (GFM)</span>
        </div>
      </footer>
    </div>
  );
}
