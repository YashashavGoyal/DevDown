import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Mermaid from './Mermaid';
import { Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PreviewProps {
  value: string;
  isDark?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
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

const MarkdownComponents = {
  code: CodeBlock,
  h1: ({ children }: any) => <h1 className="text-[32px] font-bold border-b border-border/50 pb-2 mb-6 mt-10 tracking-tight leading-tight">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-[24px] font-bold border-b border-border/50 pb-1.5 mb-4 mt-8 tracking-tight leading-tight">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-[20px] font-bold mb-3 mt-6 tracking-tight leading-snug">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-[18px] font-bold mb-2 mt-4 tracking-tight leading-snug">{children}</h4>,
  ul: ({ children }: any) => <ul className="mb-4 space-y-1.5 list-disc">{children}</ul>,
  ol: ({ children }: any) => <ol className="mb-4 space-y-1.5 list-decimal">{children}</ol>,
  li: ({ children }: any) => <li className="mb-0.5 leading-relaxed text-[15px]">{children}</li>,
  div: ({ children, align, ...props }: any) => {
    const style: React.CSSProperties = {};
    if (align) style.textAlign = align as any;
    return <div style={style} {...props}>{children}</div>;
  },
  table: ({ children }: any) => (
    <div className="table-container my-8 overflow-hidden rounded-none border border-border/50 shadow-sm bg-background">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse border-hidden">
          {children}
        </table>
      </div>
    </div>
  ),
  // Custom P to prevent hydration issues with nested block elements from rehype-raw
  p: ({ children }: any) => {
    const hasBlockChild = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && (typeof child.type === 'string' && ['div', 'pre', 'table', 'blockquote', 'ul', 'ol', 'li'].includes(child.type))
    );
    if (hasBlockChild) return <div className="mb-2 last:mb-0">{children}</div>;
    return <p className="mb-2 last:mb-0 leading-relaxed text-[15px]">{children}</p>;
  }
};

const Preview: React.FC<PreviewProps> = ({ value, isDark, containerRef, onScroll }) => {
  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-y-auto px-10 py-16 sync-scroll-container custom-scrollbar max-w-[900px] mx-auto transition-all duration-500 bg-background",
        "selection:bg-primary/20 selection:text-primary",
        isDark ? "dark" : "light"
      )}
      onScroll={onScroll}
    >
      <div className="markdown-body" data-color-mode={isDark ? "dark" : "light"}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={MarkdownComponents as any}
        >
          {value}
        </ReactMarkdown>
      </div>

      {/* Visual buffer at bottom */}
      <div className="h-32" />
    </div>
  );
};

export default Preview;
