import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import Mermaid from '../Mermaid';

export const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);

  // If no className, it's likely inline code (or a generic block without language)
  // react-markdown usually provides 'inline' prop, let's use it or fallback to checking the parent node
  const forceInline = inline || !className || !String(children).includes('\n');

  if (forceInline) {
    return (
      <code className={cn("px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[0.9em] border border-border/30", className)} {...props}>
        {children}
      </code>
    );
  }

  const code = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (language === 'mermaid') {
    return <Mermaid chart={code} />;
  }

  return (
    <div className="relative group my-8">
      <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        {language && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 bg-muted/50 px-2 py-1 rounded">
            {language}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="p-1.5 glass-card !rounded-lg text-muted-foreground hover:text-primary transition-all bg-background/50 border border-border/50 hover:scale-110 active:scale-95 shadow-lg"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className={cn(
        "p-6 rounded-2xl border border-border/50 bg-muted/10 overflow-x-auto text-sm leading-relaxed selection:bg-primary/20",
        className
      )}>
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
};
