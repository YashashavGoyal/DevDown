import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { cn } from '../lib/utils';

interface BreadcrumbItem {
  id: string;
  name: string;
  isFolder: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center gap-1.5 text-[10px] text-muted-foreground", className)}>
      <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-default">
        <Home className="w-3 h-3" />
        <span className="uppercase tracking-widest font-bold">Root</span>
      </div>
      
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
          <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-default max-w-[120px]">
            {item.isFolder && <Folder className="w-3 h-3 text-primary/60 shrink-0" />}
            <span className={cn(
                "truncate",
                index === items.length - 1 ? "font-bold text-foreground" : ""
            )}>
              {item.name}
            </span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
