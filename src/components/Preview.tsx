import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './Mermaid';

interface PreviewProps {
  value: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const Preview: React.FC<PreviewProps> = ({ value, containerRef, onScroll }) => {
  return (
    <div 
      ref={containerRef as any}
      className="markdown-body h-full w-full overflow-y-auto px-8 py-12 sync-scroll-container"
      onScroll={onScroll}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language === 'mermaid') {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />;
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom renderers for other elements if needed
          h1: ({ children }) => <h1 className="!border-b !border-border !pb-2">{children}</h1>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table className="!m-0">{children}</table>
            </div>
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default Preview;
