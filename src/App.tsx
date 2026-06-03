import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Monitor, Eye, Edit3,
  Share2, Menu, Command as CommandIcon,
  Palette, Smartphone, Check, Columns
} from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Sidebar, { type Document, type Folder } from './components/Sidebar';
import Toolbar, { type MarkdownAction } from './components/Toolbar';
import { EditorView } from '@codemirror/view';
import { cn, generateId } from './lib/utils';
import { useSettings } from './hooks/useSettings';
import SettingsModal from './components/SettingsModal';
import QuickOpen from './components/QuickOpen';
import ConfirmModal from './components/ConfirmModal';
import Breadcrumbs from './components/Breadcrumbs';
import logoDark from './assets/logo_dark.png';
import logoLight from './assets/logo_light.png';
import { type SidebarHandle } from './components/Sidebar';

const DEFAULT_DOCS: Document[] = [
  {
    id: '1',
    title: 'Welcome to DevDown',
    content: `# Welcome to DevDown 🚀\n\nDevDown is a premium, GitHub-standard Markdown editor.\n\n## Math Support (KaTeX)\nWhen $a \\ne 0$, there are two solutions to $ax^2 + bx + c = 0$ and they are\n$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$\n\n### Mermaid Demo\n\`\`\`mermaid\ngraph TD\n  A[Start] --> B(Improved UI)\n  B --> C{Premium?}\n  C -- Yes --> D[DevDown]\n  C -- No --> E[Generic Editor]\n\`\`\``,
    updatedAt: Date.now(),
    folderId: null
  }
];

const DEFAULT_FOLDERS: Folder[] = [];

export default function App() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem('devdown_docs');
      const docs: Document[] = saved ? JSON.parse(saved) : DEFAULT_DOCS;
      // Ensure all docs have folderId
      return docs.map(d => ({ ...d, folderId: d.folderId || null }));
    } catch (err) {
      console.error('Failed to parse documents from localStorage:', err);
      return DEFAULT_DOCS;
    }
  });
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('devdown_folders');
      return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
    } catch (err) {
      console.error('Failed to parse folders from localStorage:', err);
      return DEFAULT_FOLDERS;
    }
  });
  const [activeId, setActiveId] = useState(documents[0].id);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [isEditorDark, setIsEditorDark] = useState(false);
  const [palette, setPalette] = useState<'default' | 'velvet' | 'slate' | 'forest' | 'midnight'>(() => {
    const saved = localStorage.getItem('devdown_palette');
    return (saved as any) || 'default';
  });
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'view'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [deleteContentsChecked, setDeleteContentsChecked] = useState(false);

  const { settings, updateSettings, resetSettings } = useSettings();

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const sidebarRef = useRef<SidebarHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScrolling = useRef<string | null>(null);

  const activeDoc = documents.find(d => d.id === activeId) || documents[0];

  // Persistence
  useEffect(() => {
    localStorage.setItem('devdown_docs', JSON.stringify(documents));
    localStorage.setItem('devdown_folders', JSON.stringify(folders));
    localStorage.setItem('devdown_palette', palette);
  }, [documents, folders, palette]);

  // Theme logic
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
      setIsEditorDark(isDark);

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

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = (navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey);

      if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isQuickOpenOpen) setIsQuickOpenOpen(false);
        if (settings.zenMode) updateSettings({ zenMode: false });
      }

      if (isMod && (e.key === '/' || e.key === 'f')) {
        e.preventDefault();
        setIsSidebarOpen(true);
        setTimeout(() => sidebarRef.current?.focusSearch(), 100);
      }

      if (isMod && e.key === 'p') {
        e.preventDefault();
        setIsQuickOpenOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isQuickOpenOpen, settings.zenMode, updateSettings]);

  // Editor Actions
  const handleToolbarAction = useCallback((action: MarkdownAction) => {
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
  }, []);

  const updateContent = useCallback((val: string) => {
    setDocuments(docs => docs.map(d => d.id === activeId ? { ...d, content: val, updatedAt: Date.now() } : d));
  }, [activeId]);

  const createNewDoc = (folderId: string | null = null) => {
    const newDoc: Document = {
      id: generateId(),
      title: 'New Note',
      content: '# New Note\nStart writing...',
      updatedAt: Date.now(),
      folderId
    };
    setDocuments([newDoc, ...documents]);
    setActiveId(newDoc.id);
  };

  const createNewFolder = (parentId: string | null = null) => {
    const newFolder: Folder = {
      id: generateId(),
      name: 'New Folder',
      parentId
    };
    setFolders([newFolder, ...folders]);
  };

  const deleteFolder = (id: string, deleteContents: boolean = false) => {
    if (deleteContents) {
      // Recursively delete contents
      const getAllChildFolderIds = (fid: string): string[] => {
        const children = folders.filter(f => f.parentId === fid);
        return [fid, ...children.flatMap(f => getAllChildFolderIds(f.id))];
      };

      const idsToDelete = getAllChildFolderIds(id);
      setDocuments(docs => docs.filter(d => !d.folderId || !idsToDelete.includes(d.folderId)));
      setFolders(fs => fs.filter(f => !idsToDelete.includes(f.id)));
    } else {
      // Move documents and subfolders to parent's level or root
      const folder = folders.find(f => f.id === id);
      const parentId = folder?.parentId || null;

      setDocuments(docs => docs.map(d => d.folderId === id ? { ...d, folderId: parentId } : d));
      setFolders(fs => fs.map(f => f.parentId === id ? { ...f, parentId } : f).filter(f => f.id !== id));
    }
  };

  const renameFolder = (id: string, name: string) => {
    setFolders(fs => fs.map(f => f.id === id ? { ...f, name } : f));
  };

  const moveDocToFolder = (docId: string, folderId: string | null) => {
    setDocuments(docs => docs.map(d => d.id === docId ? { ...d, folderId } : d));
  };

  const moveFolderToFolder = (folderId: string, targetParentId: string | null) => {
    // Avoid moving a folder into itself
    if (folderId === targetParentId) return;

    // Avoid moving a parent into its own child (circular dependency check)
    const isChildOf = (fId: string, potentialParentId: string): boolean => {
      const folder = folders.find(f => f.id === potentialParentId);
      if (!folder || !folder.parentId) return false;
      if (folder.parentId === fId) return true;
      return isChildOf(fId, folder.parentId);
    };

    if (targetParentId && isChildOf(folderId, targetParentId)) {
      // Option: Swap, or just ignore. Let's ignore for safety.
      return;
    }

    setFolders(fs => fs.map(f => f.id === folderId ? { ...f, parentId: targetParentId } : f));
  };

  const importDocuments = (docs: Document[]) => {
    setDocuments(prev => [...docs, ...prev]);
    if (docs[0]) setActiveId(docs[0].id);
  };

  const deleteDoc = (id: string) => {
    if (documents.length === 1) return;
    setDocToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    const nextDocs = documents.filter(d => d.id !== docToDelete);
    setDocuments(nextDocs);
    if (activeId === docToDelete) setActiveId(nextDocs[0].id);
    setDocToDelete(null);
  };

  const handleConfirmDeleteFolder = () => {
    if (!folderToDelete) return;
    deleteFolder(folderToDelete, deleteContentsChecked);
    setFolderToDelete(null);
    setDeleteContentsChecked(false);
  };

  const getBreadcrumbs = () => {
    const items: { id: string; name: string; isFolder: boolean; }[] = [];
    if (!activeDoc) return items;

    let currentFolderId = activeDoc.folderId;
    while (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      if (folder) {
        items.unshift({ id: folder.id, name: folder.name, isFolder: true });
        currentFolderId = folder.parentId;
      } else {
        break;
      }
    }
    items.push({ id: activeDoc.id, name: activeDoc.title || 'Untitled', isFolder: false });
    return items;
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs: Document[] = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          id: generateId(),
          title: file.name.replace(/\.md$/i, ''),
          content,
          updatedAt: Date.now(),
          folderId: null
        };
      })
    );

    importDocuments(newDocs);
    // Reset input so the same file can be opened again if needed
    e.target.value = '';
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
        ref={sidebarRef}
        documents={documents} folders={folders} activeId={activeId} onSelect={setActiveId}
        onNew={() => createNewDoc()}
        onNewFolder={createNewFolder}
        onDelete={deleteDoc}
        onDeleteFolder={setFolderToDelete}
        onMoveToFolder={moveDocToFolder}
        onMoveFolderToFolder={moveFolderToFolder}
        onRenameFolder={renameFolder}
        isOpen={isSidebarOpen && !settings.zenMode}
        onOpenFile={handleOpenFile}
        onToggle={() => setIsSidebarOpen(false)}
        theme={theme} setTheme={setTheme}
        palette={palette} setPalette={setPalette}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isEditorDark}
      />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 relative h-full overflow-hidden transition-all duration-500",
        settings.zenMode ? "bg-card" : "bg-background"
      )}>
        {/* Header - Hidden in Zen Mode unless explicitly required */}
        {!settings.zenMode && (
          <header className="h-[var(--header-height)] flex items-center justify-between px-6 border-b border-border/50 glass z-20 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-muted rounded-xl transition-colors shrink-0"
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                <Menu className="w-5 h-5" />
              </button>
              <img 
                src={isEditorDark ? logoDark : logoLight} 
                alt="DevDown" 
                className="w-6 h-6 rounded-md shadow-sm hidden sm:block"
              />
              <div className="flex flex-col min-w-0">
                <Breadcrumbs items={getBreadcrumbs()} className="mb-0.5" />
                <input
                  value={activeDoc.title}
                  onChange={(e) => setDocuments(docs => docs.map(d => d.id === activeId ? { ...d, title: e.target.value } : d))}
                  className="bg-transparent border-none text-lg font-bold outline-none focus:text-primary transition-colors truncate max-w-[200px] md:max-w-[400px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center bg-muted/50 p-1 rounded-xl mr-2 border border-border/50 shadow-inner">
                <button onClick={() => setPalette('default')} className={cn("p-1.5 rounded-lg transition-all", palette === 'default' ? "bg-background shadow-sm" : "opacity-30")} title="Standard"><Palette className="w-3.5 h-3.5 text-primary" /></button>
                <button onClick={() => setPalette('velvet')} className={cn("p-1.5 rounded-lg transition-all", palette === 'velvet' ? "bg-background shadow-sm" : "opacity-30")} title="Velvet"><Palette className="w-3.5 h-3.5 text-[#e11d48]" /></button>
                <button onClick={() => setPalette('slate')} className={cn("p-1.5 rounded-lg transition-all", palette === 'slate' ? "bg-background shadow-sm" : "opacity-30")} title="Slate"><Palette className="w-3.5 h-3.5 text-[#475569]" /></button>
                <button onClick={() => setPalette('forest')} className={cn("p-1.5 rounded-lg transition-all", palette === 'forest' ? "bg-background shadow-sm" : "opacity-30")} title="Forest"><Palette className="w-3.5 h-3.5 text-[#22c55e]" /></button>
                <button onClick={() => setPalette('midnight')} className={cn("p-1.5 rounded-lg transition-all", palette === 'midnight' ? "bg-background shadow-sm" : "opacity-30")} title="Midnight"><Palette className="w-3.5 h-3.5 text-[#3b82f6]" /></button>
              </div>

              <div className="hidden lg:flex items-center bg-muted/50 p-1 rounded-xl border border-border/50 shadow-inner">
                <button
                  onClick={() => setViewMode('edit')}
                  className={cn("p-1.5 rounded-lg transition-all", viewMode === 'edit' ? "bg-background shadow-sm text-primary" : "text-muted-foreground opacity-50")}
                  title="Editor Only"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={cn("p-1.5 rounded-lg transition-all", viewMode === 'split' ? "bg-background shadow-sm text-primary" : "text-muted-foreground opacity-50")}
                  title="Split View"
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('view')}
                  className={cn("p-1.5 rounded-lg transition-all", viewMode === 'view' ? "bg-background shadow-sm text-primary" : "text-muted-foreground opacity-50")}
                  title="Preview Only"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
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
        )}

        {/* Toolbar - Customizable visibility in Zen Mode */}
        <Toolbar
          onAction={handleToolbarAction}
          className={cn(
            (viewMode === 'view' && "hidden lg:flex"),
            (settings.zenMode && !settings.showToolbarInZen) && "hidden"
          )}
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
                  isDark={isEditorDark}
                  fontSize={settings.fontSize}
                  lineNumbers={settings.lineNumbers}
                  lineWrapping={settings.lineWrapping}
                />
              </motion.div>
            )}

            {(viewMode === 'split' || viewMode === 'view') && (
              <motion.div
                key="preview-pane" initial={{ flex: 0, opacity: 0 }} animate={{ flex: viewMode === 'split' ? 1 : 2, opacity: 1 }} exit={{ flex: 0, opacity: 0 }}
                className={cn(
                  "h-full transition-all duration-500 overflow-hidden",
                  viewMode === 'split' ? "w-full lg:w-1/2" : "w-full",
                  settings.zenMode && "px-10 py-6"
                )}
              >
                <Preview value={activeDoc.content} isDark={isEditorDark} containerRef={previewContainerRef} onScroll={() => handleScroll('preview')} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Mobile Toggle */}
          {!settings.zenMode && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-foreground/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-2xl z-40 lg:hidden">
              <button onClick={() => setViewMode('edit')} className={cn("px-6 py-2.5 rounded-full transition-all flex items-center gap-2", viewMode === 'edit' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/70")}><Edit3 className="w-4 h-4" /> Edit</button>
              <button onClick={() => setViewMode('view')} className={cn("px-6 py-2.5 rounded-full transition-all flex items-center gap-2", viewMode === 'view' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/70")}><Eye className="w-4 h-4" /> View</button>
            </div>
          )}
        </main>

        {/* Status Bar */}
        {!settings.zenMode && (
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
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} updateSettings={updateSettings} resetSettings={resetSettings}
        documents={documents} onImport={importDocuments}
        isDark={isEditorDark}
      />

      <QuickOpen
        isOpen={isQuickOpenOpen} onClose={() => setIsQuickOpenOpen(false)}
        documents={documents} onSelect={(id) => { setActiveId(id); setIsQuickOpenOpen(false); }}
      />

      <AnimatePresence>
        {docToDelete && (
          <ConfirmModal
            title="Delete Note?"
            description={`Are you sure you want to delete "${documents.find(d => d.id === docToDelete)?.title || 'this note'}"? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={handleConfirmDelete}
            onCancel={() => setDocToDelete(null)}
            danger
          />
        )}

        {folderToDelete && (
          <ConfirmModal
            title="Delete Folder?"
            description={`Are you sure you want to delete "${folders.find(f => f.id === folderToDelete)?.name}"?`}
            confirmLabel="Delete"
            onConfirm={handleConfirmDeleteFolder}
            onCancel={() => setFolderToDelete(null)}
            danger
          >
            <label className="flex items-center gap-2 cursor-pointer group mt-4">
              <input
                type="checkbox"
                checked={deleteContentsChecked}
                onChange={(e) => setDeleteContentsChecked(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-primary/30"
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Delete folder contents (including subfolders and notes)
              </span>
            </label>
          </ConfirmModal>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".md"
        multiple
        className="hidden"
      />
    </div>
  );
}
