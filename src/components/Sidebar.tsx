import React from 'react';
import { 
  FileText, Plus, Search, Trash2, 
  Settings, Zap, Layout
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  onDelete: (id: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  activeId, 
  onSelect, 
  onNew, 
  onDelete,
  isOpen
}) => {
  return (
    <aside className={cn(
      "h-full bg-muted/20 backdrop-blur-md border-r border-border flex flex-col transition-all duration-300 ease-in-out z-30",
      isOpen ? "w-[280px]" : "w-0 -translate-x-full"
    )}>
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight">Docs</span>
        </div>
        <button 
          onClick={onNew}
          className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
          title="New Document"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Document Search / Filter */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full bg-muted/40 border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {documents.map((doc) => (
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
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="glass-inset rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="text-xs font-medium">Pro Account</span>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
