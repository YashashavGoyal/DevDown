import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Mermaid from './Mermaid';
import { Copy, Check } from 'lucide-react';

interface PreviewProps {
  value: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const CodeBlock = ({ children, className }: { children: any, className?: string }) => {
  const [copied, setCopied] = useState(false);
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
    <div className="relative group my-4">
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 glass-card !rounded-lg text-muted-foreground hover:text-primary transition-colors bg-background/50"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <code className={className}>
        {children}
      </code>
    </div>
  );
};

const Preview: React.FC<PreviewProps> = ({ value, containerRef, onScroll }) => {
  return (
    <div 
      ref={containerRef as any}
      className="markdown-body h-full w-full overflow-y-auto px-8 py-12 sync-scroll-container custom-scrollbar"
      onScroll={onScroll}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock as any,
          h1: ({ children }) => <h1 className="text-4xl font-black mb-6 mt-10 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-8 pb-2 border-b border-border/50 tracking-tight">{children}</h2>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-border/50 glass-inset">
              <table className="!m-0 w-full">{children}</table>
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 bg-primary/5 px-6 py-1 my-6 italic rounded-r-xl text-foreground/80">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary hover:underline font-medium decoration-primary/30 underline-offset-4 decoration-2" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-6 my-4 space-y-2 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-6 my-4 space-y-2 text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 marker:text-primary transition-colors">
              {children}
            </li>
          ),
          p: ({ children }) => <p className="my-4 text-foreground/90 leading-relaxed">{children}</p>,
          h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-8 tracking-tight">{children}</h3>,
          h4: ({ children }) => <h4 className="text-lg font-bold mb-2 mt-6 tracking-tight">{children}</h4>,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default Preview;
