import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Command } from 'lucide-react';
import { cn } from '../lib/utils';
import { type Document } from './Sidebar';

interface QuickOpenProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onSelect: (id: string) => void;
}

const QuickOpen: React.FC<QuickOpenProps> = ({ isOpen, onClose, documents, onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.content.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-start justify-center pt-[15vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative w-full max-w-lg bg-card border border-border/50 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Search or jump to note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60"
            />
            <div className="flex items-center gap-1.5 opacity-40">
               <Command className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold">P</span>
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-10 text-center space-y-2 opacity-40">
                 <Search className="w-8 h-8 mx-auto mb-2" />
                 <p className="text-xs font-medium">No documents found matching "{search}"</p>
              </div>
            ) : (
              filtered.map((doc, i) => (
                <button
                  key={doc.id}
                  onClick={() => { onSelect(doc.id); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all",
                    i === selectedIndex ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={cn("w-4 h-4", i === selectedIndex ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{doc.title || 'Untitled'}</span>
                  </div>
                  <span className={cn("text-[10px] uppercase tracking-widest font-mono opacity-50", i === selectedIndex ? "text-primary-foreground" : "")}>
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between px-4">
             <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold">
                   <kbd className="px-1 bg-card border rounded shadow-sm">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold">
                   <kbd className="px-1 bg-card border rounded shadow-sm">Enter</kbd> Select
                </span>
             </div>
             <span className="text-[10px] text-muted-foreground uppercase font-bold">
                <kbd className="px-1 bg-card border rounded shadow-sm">Esc</kbd> Close
             </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickOpen;
