import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Trash2,
  Settings, Zap, Layout, X, Palette,
  Sun, Moon, Monitor, FolderOpen,
  FolderPlus, Folder, ChevronRight, ChevronDown,
  MoreVertical, MoreHorizontal, FolderInput
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  folderId: string | null;
}

interface SidebarProps {
  documents: Document[];
  folders: Folder[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onNewFolder: () => void;
  onOpenFile: () => void;
  onDelete: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  palette: 'default' | 'velvet' | 'slate' | 'forest' | 'midnight';
  setPalette: (p: 'default' | 'velvet' | 'slate' | 'forest' | 'midnight') => void;
  onOpenSettings: () => void;
}

export interface SidebarHandle {
  focusSearch: () => void;
}

const Sidebar = forwardRef<SidebarHandle, SidebarProps>(({
  documents,
  folders,
  activeId,
  onSelect,
  onNew,
  onNewFolder,
  onOpenFile,
  onDelete,
  onDeleteFolder,
  onMoveToFolder,
  onRenameFolder,
  isOpen,
  onToggle,
  theme,
  setTheme,
  palette,
  setPalette,
  onOpenSettings
}, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [movingDocId, setMovingDocId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    }
  }));

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.length > 0;

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const childDocs = documents.filter(d => d.folderId === folder.id);

    return (
      <div key={folder.id} className="space-y-1">
        <div 
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer text-muted-foreground hover:text-foreground transition-all"
          style={{ paddingLeft: `${level * 12 + 12}px` }}
          onClick={() => toggleFolder(folder.id)}
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <Folder className={cn("w-4 h-4", isExpanded ? "text-primary fill-primary/10" : "text-muted-foreground/50")} />
          <input 
            defaultValue={folder.name}
            onBlur={(e) => onRenameFolder(folder.id, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium focus:text-primary min-w-0"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive rounded transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden space-y-1"
            >
              {childFolders.map(f => renderFolder(f, level + 1))}
              {childDocs.map(doc => renderDocument(doc, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderDocument = (doc: Document, level: number = 0) => (
    <div
      key={doc.id}
      onClick={() => onSelect(doc.id)}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border border-transparent relative",
        activeId === doc.id
          ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
          : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
      )}
      style={{ marginLeft: `${level * 12}px` }}
    >
      <FileText className={cn(
        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
        activeId === doc.id ? "text-primary" : "text-muted-foreground/40"
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.title || 'Untitled'}</p>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMovingDocId(movingDocId === doc.id ? null : doc.id);
          }}
          className={cn("p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg", movingDocId === doc.id && "bg-primary/10 text-primary")}
          title="Move to Folder"
        >
          <FolderInput className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc.id);
          }}
          className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {movingDocId === doc.id && (
        <div 
          className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-2xl z-[110] p-2 glass animate-in fade-in slide-in-from-top-2"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 px-2 py-1 mb-1">Move to...</p>
          <button 
            onClick={() => { onMoveToFolder(doc.id, null); setMovingDocId(null); }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary flex items-center gap-2"
          >
            <Layout className="w-3 h-3" /> Root Level
          </button>
          {folders.map(f => (
            <button 
              key={f.id}
              onClick={() => { onMoveToFolder(doc.id, f.id); setMovingDocId(null); }}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary flex items-center gap-2"
            >
              <Folder className="w-3 h-3" /> {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const rootFolders = folders.filter(f => f.parentId === null);
  const rootDocs = documents.filter(d => d.folderId === null);

  return (
    <aside className={cn(
      "h-full flex flex-col transition-all duration-300 ease-in-out z-[100] overflow-hidden",
      "lg:relative fixed inset-y-0 left-0",
      "lg:bg-background bg-background border-r border-border shadow-xl lg:shadow-none",
      isOpen
        ? "w-[var(--sidebar-width)] translate-x-0 opacity-100 visible"
        : "w-0 -translate-x-full opacity-0 invisible"
    )}>
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight text-lg">My Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNew}
            className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
            title="New Document"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onNewFolder}
            className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenFile}
            className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
            title="Open MD File"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 hover:bg-muted text-muted-foreground rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Hierarchical List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {isSearching ? (
          filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40 py-10 text-center px-4">
              <Search className="w-8 h-8 mb-2" />
              <p className="text-xs font-medium">No results found</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 px-3 py-2">Search Results</p>
              {filteredDocuments.map(doc => renderDocument(doc))}
            </div>
          )
        ) : (
          <>
            {rootFolders.map(f => renderFolder(f))}
            {rootDocs.map(d => renderDocument(d))}
            {rootFolders.length === 0 && rootDocs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-20 text-center px-6">
                <FileText className="w-10 h-10 mb-4" />
                <p className="text-sm font-medium">Workspace is empty. Create a note to get started.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 space-y-4 bg-muted/5">
        <div className="lg:hidden space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Theme</span>
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
              <button onClick={() => setTheme('light')} className={cn("p-1.5 rounded-lg transition-all", theme === 'light' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}><Sun className="w-3 h-3" /></button>
              <button onClick={() => setTheme('dark')} className={cn("p-1.5 rounded-lg transition-all", theme === 'dark' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}><Moon className="w-3 h-3" /></button>
              <button onClick={() => setTheme('system')} className={cn("p-1.5 rounded-lg transition-all", theme === 'system' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}><Monitor className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Palette</span>
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
              <button onClick={() => setPalette('default')} className={cn("p-1.5 rounded-lg transition-all", palette === 'default' ? "bg-background shadow-sm" : "opacity-30")}><Palette className="w-3.5 h-3.5 text-primary" /></button>
              <button onClick={() => setPalette('velvet')} className={cn("p-1.5 rounded-lg transition-all", palette === 'velvet' ? "bg-background shadow-sm" : "opacity-30")}><Palette className="w-3.5 h-3.5 text-[#e11d48]" /></button>
              <button onClick={() => setPalette('slate')} className={cn("p-1.5 rounded-lg transition-all", palette === 'slate' ? "bg-background shadow-sm" : "opacity-30")}><Palette className="w-3.5 h-3.5 text-[#475569]" /></button>
              <button onClick={() => setPalette('forest')} className={cn("p-1.5 rounded-lg transition-all", palette === 'forest' ? "bg-background shadow-sm" : "opacity-30")}><Palette className="w-3.5 h-3.5 text-[#22c55e]" /></button>
              <button onClick={() => setPalette('midnight')} className={cn("p-1.5 rounded-lg transition-all", palette === 'midnight' ? "bg-background shadow-sm" : "opacity-30")}><Palette className="w-3.5 h-3.5 text-[#3b82f6]" /></button>
            </div>
          </div>
        </div>

        <div className="glass-inset rounded-2xl p-4 flex items-center justify-between bg-muted/20 border border-border/50">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-1 rounded-lg">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            </div>
            <span className="text-xs font-bold tracking-tight">Pro Account</span>
          </div>
          <Settings
            onClick={onOpenSettings}
            className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-all hover:rotate-90"
          />
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
