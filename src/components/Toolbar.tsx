import React from 'react';
import { 
  Italic, Link, Image, List, ListOrdered, 
  Code, Table, SquareFunction, LayoutDashboard, 
  Type, Heading1, Heading2, Quote, GitMerge
} from 'lucide-react';
import { cn } from '../lib/utils';
import { type LucideIcon } from 'lucide-react';

export type MarkdownAction = 
  | 'bold' | 'italic' | 'heading1' | 'heading2' | 'quote' 
  | 'link' | 'image' | 'list' | 'list-ordered' | 'code' | 'table' 
  | 'math' | 'mermaid-graph' | 'mermaid-sequence';

interface ToolbarProps {
  onAction: (action: MarkdownAction) => void;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAction, className }) => {
  const Button = ({ 
    icon: Icon, 
    onClick, 
    title, 
    active = false 
  }: { 
    icon: LucideIcon, 
    onClick: () => void, 
    title: string,
    active?: boolean
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all duration-200 flex items-center justify-center group relative",
        active 
          ? "bg-primary/20 text-primary" 
          : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-border">
        {title}
      </span>
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-border/50 mx-1" />;

  return (
    <div className={cn(
      "flex items-center gap-1 p-1 bg-muted/30 backdrop-blur-sm border-b border-border h-[var(--toolbar-height)] overflow-x-auto no-scrollbar shrink-0",
      className
    )}>
      <div className="flex items-center gap-1 px-2">
        <Button icon={Type} onClick={() => onAction('bold')} title="Bold (Ctrl+B)" />
        <Button icon={Italic} onClick={() => onAction('italic')} title="Italic (Ctrl+I)" />
        <Divider />
        <Button icon={Heading1} onClick={() => onAction('heading1')} title="Heading 1" />
        <Button icon={Heading2} onClick={() => onAction('heading2')} title="Heading 2" />
        <Button icon={Quote} onClick={() => onAction('quote')} title="Blockquote" />
        <Divider />
        <Button icon={Link} onClick={() => onAction('link')} title="Link" />
        <Button icon={Image} onClick={() => onAction('image')} title="Image" />
        <Divider />
        <Button icon={List} onClick={() => onAction('list')} title="Bullet List" />
        <Button icon={ListOrdered} onClick={() => onAction('list-ordered')} title="Numbered List" />
        <Divider />
        <Button icon={Code} onClick={() => onAction('code')} title="Code Block" />
        <Button icon={Table} onClick={() => onAction('table')} title="Table" />
        <Divider />
        <Button icon={SquareFunction} onClick={() => onAction('math')} title="Math Formula (KaTeX)" />
        <Button icon={LayoutDashboard} onClick={() => onAction('mermaid-graph')} title="Mermaid Flowchart" />
        <Button icon={GitMerge} onClick={() => onAction('mermaid-sequence')} title="Mermaid Sequence" />
      </div>
    </div>
  );
};

export default Toolbar;
