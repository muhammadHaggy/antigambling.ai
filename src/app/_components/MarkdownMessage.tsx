import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-white mb-2 mt-3 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-white mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-white mb-1 mt-2 first:mt-0">
              {children}
            </h3>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-white mb-2 last:mb-0">
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-white mb-2 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-white mb-2 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-white">
              {children}
            </li>
          ),
          
          // Code
          code: (props) => {
            const { className, children, ...rest } = props;
            const inline = !className?.includes('language-');
            if (inline) {
              return (
                <code
                  className="bg-gray-700 text-blue-300 px-1 py-0.5 rounded text-xs font-mono"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2 ${className || ''}`}
                {...rest}
              >
                {children}
              </code>
            );
          },
          
          // Pre (code blocks)
          pre: ({ children }) => (
            <pre className="bg-gray-900 rounded-lg mb-2 overflow-x-auto">
              {children}
            </pre>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-800/50 rounded-r-lg mb-2 italic text-gray-300">
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border-collapse border border-gray-600 text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-600 bg-gray-700 px-3 py-2 text-left font-semibold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-600 px-3 py-2 text-white">
              {children}
            </td>
          ),
          
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              {children}
            </a>
          ),
          
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-200">
              {children}
            </em>
          ),
          
          // Strikethrough
          del: ({ children }) => (
            <del className="line-through text-gray-400">
              {children}
            </del>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="border-gray-600 my-3" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 