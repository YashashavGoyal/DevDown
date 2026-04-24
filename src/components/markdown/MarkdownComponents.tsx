import React from 'react';
import { CodeBlock } from './CodeBlock';

export const MarkdownComponents = {
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
