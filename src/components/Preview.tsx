import React, { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Mermaid from './Mermaid';
import { Copy, Check, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface PreviewProps {
  value: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const CodeBlock = ({ children, className }: any) => {
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
        "p-6 rounded-2xl border border-border/50 bg-muted/10 overflow-x-auto text-sm leading-relaxed overflow-y-hidden selection:bg-primary/20",
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
  h1: ({ children }: any) => (
    <div className="group relative">
      <h1 className="text-4xl font-black mb-8 mt-12 tracking-tight flex items-center gap-3">
        <span className="w-2 h-8 bg-primary rounded-full" />
        {children}
      </h1>
    </div>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-extrabold mb-6 mt-12 pb-3 border-b border-border/50 tracking-tight flex items-center gap-2 group">
      {children}
      <span className="opacity-0 group-hover:opacity-30 transition-opacity text-primary">#</span>
    </h2>
  ),
  h3: ({ children }: any) => <h3 className="text-xl font-bold mb-4 mt-10 tracking-tight text-foreground/90">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-lg font-bold mb-3 mt-8 tracking-tight text-foreground/80">{children}</h4>,
  p: ({ children }: any) => <p className="my-5 text-foreground/85 leading-relaxed text-[15px]">{children}</p>,
  ul: ({ children }: any) => (
    <ul className="list-none my-6 space-y-3">
      {React.Children.map(children, (child) => child)}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside ml-6 my-6 space-y-3 text-foreground/85">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="flex gap-3 text-foreground/85 text-[15px] leading-relaxed">
      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
      <div className="flex-1">{children}</div>
    </li>
  ),
  blockquote: ({ children }: any) => (
    <div className="my-8 relative pl-8 pr-6 py-1 bg-gradient-to-r from-primary/5 to-transparent rounded-r-3xl border-l-4 border-primary/40 italic text-foreground/80 overflow-hidden group">
      <div className="absolute left-2 top-2 opacity-5 italic text-6xl select-none font-serif group-hover:scale-110 transition-transform">"</div>
      {children}
    </div>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-8 rounded-3xl border border-border/50 shadow-xl shadow-primary/5">
      <table className="w-full text-sm border-collapse text-left bg-card/50 backdrop-blur-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-muted/40 uppercase text-[10px] font-bold tracking-widest text-muted-foreground border-b border-border/50">{children}</thead>,
  th: ({ children }: any) => <th className="px-6 py-4">{children}</th>,
  td: ({ children }: any) => <td className="px-6 py-4 border-b border-border/10">{children}</td>,
  tr: ({ children }: any) => <tr className="hover:bg-primary/5 transition-colors group">{children}</tr>,
  img: ({ src, alt, ...props }: any) => (
    <div className="my-8 rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-all hover:scale-[1.01] bg-muted/20">
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto mx-auto block"
        {...props}
      />
      {alt && <p className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40 py-3 bg-muted/10">{alt}</p>}
    </div>
  ),
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      className="text-primary hover:text-primary/80 transition-all font-semibold underline decoration-primary/20 underline-offset-4 decoration-2 hover:decoration-primary" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  div: ({ children, align, ...props }: any) => (
    <div 
      style={{ textAlign: align as any }} 
      className={cn(align === 'center' ? 'flex flex-col items-center' : '')} 
      {...props}
    >
      {children}
    </div>
  ),
  hr: () => <hr className="my-16 border-t border-border/30 relative after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-top-px after:w-16 after:h-px after:bg-primary" />,
};

const Preview: React.FC<PreviewProps> = ({ value, containerRef, onScroll }) => {
  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-y-auto px-10 py-16 sync-scroll-container custom-scrollbar max-w-[900px] mx-auto transition-all duration-500",
        "selection:bg-primary/20 selection:text-primary"
      )}
      onScroll={onScroll}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={MarkdownComponents as any}
      >
        {value}
      </ReactMarkdown>
      
      {/* Visual buffer at bottom */}
      <div className="h-32" />
    </div>
  );
};

export default Preview;
