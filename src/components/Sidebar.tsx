import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  FileText, Plus, Search, Trash2,
  Settings, Zap, Layout, X, Palette,
  Sun, Moon, Monitor, FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface SidebarProps {
  documents: Document[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onOpenFile: () => void;
  onDelete: (id: string) => void;
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
  activeId,
  onSelect,
  onNew,
  onOpenFile,
  onDelete,
  isOpen,
  onToggle,
  theme,
  setTheme,
  palette,
  setPalette,
  onOpenSettings
}, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    }
  }));

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <span className="font-bold tracking-tight">Docs</span>
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

      {/* Document Search / Filter */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-10 text-center px-4">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-xs font-medium">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                activeId === doc.id
                  ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className={cn(
                "w-4 h-4 transition-transform group-hover:scale-110",
                activeId === doc.id ? "text-primary" : "text-muted-foreground/50"
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title || 'Untitled'}</p>
                <p className="text-[10px] opacity-50 font-mono">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border/50 space-y-4">
        {/* Mobile-only Theme/Palette Controls */}
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

        <div className="glass-inset rounded-2xl p-4 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="text-xs font-medium">Pro Account</span>
          </div>
          <Settings
            onClick={onOpenSettings}
            className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
          />
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
