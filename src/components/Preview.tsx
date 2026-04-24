import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';
import { MarkdownComponents } from './markdown/MarkdownComponents';

interface PreviewProps {
  value: string;
  isDark?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

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

