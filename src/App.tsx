import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Monitor, Eye, Edit3, 
  Share2, Menu, Command as CommandIcon,
  Palette, Smartphone, Info, Check
} from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Sidebar, { type Document } from './components/Sidebar';
import Toolbar, { type MarkdownAction } from './components/Toolbar';
import { EditorView } from '@codemirror/view';
import { cn, generateId } from './lib/utils';

const DEFAULT_DOCS: Document[] = [
  {
    id: '1',
    title: 'Welcome to DevDown',
    content: `# Welcome to DevDown 🚀\n\nDevDown is a premium, GitHub-standard Markdown editor.\n\n## Math Support (KaTeX)\nWhen $a \\ne 0$, there are two solutions to $ax^2 + bx + c = 0$ and they are\n$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$\n\n### Mermaid Demo\n\`\`\`mermaid\ngraph TD\n  A[Start] --> B(Improved UI)\n  B --> C{Premium?}\n  C -- Yes --> D[DevDown]\n  C -- No --> E[Generic Editor]\n\`\`\``,
    updatedAt: Date.now()
  }
];

export default function App() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem('devdown_docs');
      return saved ? JSON.parse(saved) : DEFAULT_DOCS;
    } catch (err) {
      console.error('Failed to parse documents from localStorage:', err);
      return DEFAULT_DOCS;
    }
  });
  const [activeId, setActiveId] = useState(documents[0].id);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [palette, setPalette] = useState<'default' | 'velvet' | 'slate' | 'forest' | 'midnight'>(() => {
    const saved = localStorage.getItem('devdown_palette');
    return (saved as any) || 'default';
  });
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'view'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const isScrolling = useRef<string | null>(null);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0];

  // Persistence
  useEffect(() => {
    localStorage.setItem('devdown_docs', JSON.stringify(documents));
    localStorage.setItem('devdown_palette', palette);
  }, [documents, palette]);

  // Theme logic
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
      
      // Apply palette
      root.classList.remove('theme-velvet', 'theme-slate', 'theme-forest', 'theme-midnight');
      if (palette !== 'default') root.classList.add(`theme-${palette}`);
    };

    applyTheme();
    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme, palette, mounted]);

  // Sync scroll
  const handleScroll = useCallback((source: 'editor' | 'preview') => {
    if (isScrolling.current && isScrolling.current !== source) return;
    isScrolling.current = source;
    const sourceEl = source === 'editor' ? editorContainerRef.current : previewContainerRef.current;
    const targetEl = source === 'editor' ? previewContainerRef.current : editorContainerRef.current;
    if (sourceEl && targetEl) {
      const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
      targetEl.scrollTop = percentage * (targetEl.scrollHeight - targetEl.clientHeight);
    }
    setTimeout(() => { isScrolling.current = null; }, 50);
  }, []);

  // Editor Actions
  const handleToolbarAction = (action: MarkdownAction) => {
    if (!editorViewRef.current) return;
    const view = editorViewRef.current;
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);

    let insertion = '';

    const getMultiLineInsertion = (prefix: string | ((line: string, i: number) => string)) => {
      if (!selectedText) return typeof prefix === 'function' ? prefix('text', 0) : `${prefix}text`;
      return selectedText.split('\n').map((line, i) => 
        typeof prefix === 'function' ? prefix(line, i) : `${prefix}${line}`
      ).join('\n');
    };

    switch (action) {
      case 'bold': insertion = `**${selectedText || 'bold text'}**`; break;
      case 'italic': insertion = `*${selectedText || 'italic text'}*`; break;
      case 'heading1': insertion = `\n# ${selectedText || 'Heading 1'}\n`; break;
      case 'heading2': insertion = `\n## ${selectedText || 'Heading 2'}\n`; break;
      case 'quote': insertion = `\n${getMultiLineInsertion('> ')}\n`; break;
      case 'link': insertion = `[${selectedText || 'link text'}](https://)`; break;
      case 'image': insertion = `![${selectedText || 'alt text'}](https://)`; break;
      case 'list': insertion = `\n${getMultiLineInsertion('- ')}\n`; break;
      case 'list-ordered': insertion = `\n${getMultiLineInsertion((line, i) => `${i + 1}. ${line}`)}\n`; break;
      case 'code': insertion = `\n\`\`\`javascript\n${selectedText || '// code here'}\n\`\`\`\n`; break;
      case 'table': insertion = `\n| ${selectedText || 'Header'} | Header |\n| --- | --- |\n| Cell | Cell |\n`; break;
      case 'math': insertion = `\n$$\n${selectedText || 'E = mc^2'}\n$$\n`; break;
      case 'mermaid-graph': insertion = `\n\`\`\`mermaid\ngraph TD\n  A[Start] --> B[End]\n\`\`\`\n`; break;
      case 'mermaid-sequence': insertion = `\n\`\`\`mermaid\nsequenceDiagram\n  Alice->>John: Hello John, how are you?\n  John-->>Alice: Great!\n\`\`\`\n`; break;
      default: return;
    }

    view.dispatch({
      changes: { from, to, insert: insertion },
      selection: { anchor: from + insertion.length }
    });
    view.focus();
  };

  const updateContent = (val: string) => {
    setDocuments(docs => docs.map(d => d.id === activeId ? { ...d, content: val, updatedAt: Date.now() } : d));
  };

  const createNewDoc = () => {
    const newDoc: Document = {
      id: generateId(),
      title: 'New Note',
      content: '# New Note\nStart writing...',
      updatedAt: Date.now()
    };
    setDocuments([newDoc, ...documents]);
    setActiveId(newDoc.id);
  };

  const deleteDoc = (id: string) => {
    if (documents.length === 1) return;
    const docToDelete = documents.find(d => d.id === id);
    if (!docToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${docToDelete.title}"?`)) {
      const nextDocs = documents.filter(d => d.id !== id);
      setDocuments(nextDocs);
      if (activeId === id) setActiveId(nextDocs[0].id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(activeDoc.content);
    setIsSharing(true);
    setTimeout(() => setIsSharing(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-background transition-colors duration-500 overflow-hidden text-foreground selection:bg-primary/20">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar 
        documents={documents} activeId={activeId} onSelect={setActiveId}
        onNew={createNewDoc} onDelete={deleteDoc} isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        theme={theme} setTheme={setTheme}
        palette={palette} setPalette={setPalette}
      />

      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Header */}
        <header className="h-[var(--header-height)] flex items-center justify-between px-6 border-b border-border/50 glass z-20 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-muted rounded-xl transition-colors shrink-0"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <input 
                value={activeDoc.title}
                onChange={(e) => setDocuments(docs => docs.map(d => d.id === activeId ? { ...d, title: e.target.value } : d))}
                className="bg-transparent border-none text-lg font-bold outline-none focus:text-primary transition-colors truncate max-w-[200px] md:max-w-[400px]"
              />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Info className="w-3 h-3" /> Autosaved to LocalStorage
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Palette Switcher - Hidden on mobile */}
            <div className="hidden lg:flex items-center bg-muted/50 p-1 rounded-xl mr-2 border border-border/50 shadow-inner">
               <button onClick={() => setPalette('default')} className={cn("p-1.5 rounded-lg transition-all", palette === 'default' ? "bg-background shadow-sm" : "opacity-30")} title="Standard"><Palette className="w-3.5 h-3.5 text-primary" /></button>
               <button onClick={() => setPalette('velvet')} className={cn("p-1.5 rounded-lg transition-all", palette === 'velvet' ? "bg-background shadow-sm" : "opacity-30")} title="Velvet"><Palette className="w-3.5 h-3.5 text-[#e11d48]" /></button>
               <button onClick={() => setPalette('slate')} className={cn("p-1.5 rounded-lg transition-all", palette === 'slate' ? "bg-background shadow-sm" : "opacity-30")} title="Slate"><Palette className="w-3.5 h-3.5 text-[#475569]" /></button>
               <button onClick={() => setPalette('forest')} className={cn("p-1.5 rounded-lg transition-all", palette === 'forest' ? "bg-background shadow-sm" : "opacity-30")} title="Forest"><Palette className="w-3.5 h-3.5 text-[#22c55e]" /></button>
               <button onClick={() => setPalette('midnight')} className={cn("p-1.5 rounded-lg transition-all", palette === 'midnight' ? "bg-background shadow-sm" : "opacity-30")} title="Midnight"><Palette className="w-3.5 h-3.5 text-[#3b82f6]" /></button>
            </div>

            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
              <button onClick={() => setTheme('light')} className={cn("p-2 rounded-lg transition-all", theme === 'light' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('dark')} className={cn("p-2 rounded-lg transition-all", theme === 'dark' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}><Moon className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('system')} className={cn("p-2 rounded-lg transition-all", theme === 'system' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}><Monitor className="w-3.5 h-3.5" /></button>
            </div>
            
            <button 
              onClick={handleShare}
              className={cn(
                "p-2.5 rounded-xl shadow-lg transition-all ml-1 hidden lg:block",
                isSharing 
                  ? "bg-green-500 text-white shadow-green-500/20" 
                  : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105 active:scale-95"
              )}
              title="Copy link to clipboard"
            >
              {isSharing ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <Toolbar 
          onAction={handleToolbarAction} 
          className={cn(viewMode === 'view' && "hidden lg:flex")}
        />

        {/* Editor & Preview */}
        <main className="flex-1 flex overflow-hidden lg:flex-row flex-col">
          <AnimatePresence mode="popLayout">
            {(viewMode === 'split' || viewMode === 'edit') && (
              <motion.div 
                key="editor-pane" initial={{ flex: 0, opacity: 0 }} animate={{ flex: viewMode === 'split' ? 1 : 2, opacity: 1 }} exit={{ flex: 0, opacity: 0 }}
                className={cn("h-full border-r border-border transition-all duration-500 overflow-hidden relative group", viewMode === 'split' ? "w-full lg:w-1/2" : "w-full")}
              >
                <Editor 
                  value={activeDoc.content} onChange={updateContent} 
                  onScroll={() => handleScroll('editor')} containerRef={editorContainerRef}
                  onEditorCreate={(v) => editorViewRef.current = v}
                  onAction={handleToolbarAction}
                  isDark={document.documentElement.classList.contains('dark')}
                />
              </motion.div>
            )}

            {(viewMode === 'split' || viewMode === 'view') && (
              <motion.div 
                key="preview-pane" initial={{ flex: 0, opacity: 0 }} animate={{ flex: viewMode === 'split' ? 1 : 2, opacity: 1 }} exit={{ flex: 0, opacity: 0 }}
                className={cn("h-full transition-all duration-500 overflow-hidden", viewMode === 'split' ? "w-full lg:w-1/2" : "w-full")}
              >
                <Preview value={activeDoc.content} containerRef={previewContainerRef} onScroll={() => handleScroll('preview')} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Mobile Toggle */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-foreground/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-2xl z-40 lg:hidden">
            <button onClick={() => setViewMode('edit')} className={cn("px-6 py-2.5 rounded-full transition-all flex items-center gap-2", viewMode === 'edit' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/70")}><Edit3 className="w-4 h-4" /> Edit</button>
            <button onClick={() => setViewMode('view')} className={cn("px-6 py-2.5 rounded-full transition-all flex items-center gap-2", viewMode === 'view' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/70")}><Eye className="w-4 h-4" /> View</button>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="h-8 shrink-0 flex items-center justify-between px-6 bg-muted/30 border-t border-border/50 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><CommandIcon className="w-3 h-3" /> UTF-8</span>
            <span>{activeDoc.content.length} Characters</span>
            <span>{activeDoc.content.split(/\s+/).filter(Boolean).length} Words</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5 hidden sm:flex"><Smartphone className="w-3 h-3" /> Responsive Mode</span>
             <span className="text-primary font-bold">● Live Sync</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
