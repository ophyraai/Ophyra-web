"use client";

import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({node, ...props}) => <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ofira-text mb-8 pb-4 border-b border-ofira-card-border" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-ofira-text mt-10 mb-4" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-xl font-medium text-ofira-text mt-8 mb-3" {...props} />,
        p: ({node, ...props}) => <p className="text-ofira-text-secondary leading-relaxed mb-6 text-[15px] sm:text-base" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-ofira-text-secondary text-[15px] sm:text-base space-y-2" {...props} />,
        li: ({node, ...props}) => <li className="" {...props} />,
        a: ({node, ...props}) => <a className="text-ofira-primary hover:text-ofira-primary/80 transition-colors underline underline-offset-4 decoration-ofira-primary/30" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-ofira-text" {...props} />,
        em: ({node, ...props}) => <em className="italic text-ofira-text-secondary" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
