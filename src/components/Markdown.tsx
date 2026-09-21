import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * react-markdown hands every element component a `node` prop (the hast node).
 * Spreading it onto a DOM element leaks `node="[object Object]"` into the
 * markup, so it is stripped here.
 */
function dom<P extends { node?: unknown }>(props: P): Omit<P, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest as Omit<P, "node">;
}

/**
 * Renders article Markdown.
 *
 * Raw HTML is intentionally not enabled (`rehype-raw` is not installed), so a
 * stray `<script>` in an article body is escaped instead of executed.
 *
 * The project does not use `@tailwindcss/typography`, so each element is
 * styled explicitly here.
 */
export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`text-zinc-700 dark:text-zinc-300 ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1
              className="mt-8 mb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              {...dom(props)}
            />
          ),
          h2: (props) => (
            <h2
              className="mt-8 mb-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              {...dom(props)}
            />
          ),
          h3: (props) => (
            <h3
              className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              {...dom(props)}
            />
          ),
          h4: (props) => (
            <h4
              className="mt-4 mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50"
              {...dom(props)}
            />
          ),
          p: (props) => <p className="my-4 leading-relaxed" {...dom(props)} />,
          ul: (props) => (
            <ul className="my-4 list-disc space-y-1 pl-6" {...dom(props)} />
          ),
          ol: (props) => (
            <ol className="my-4 list-decimal space-y-1 pl-6" {...dom(props)} />
          ),
          li: (props) => <li className="leading-relaxed" {...dom(props)} />,
          blockquote: (props) => (
            <blockquote
              className="my-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              {...dom(props)}
            />
          ),
          hr: (props) => (
            <hr className="my-8 border-zinc-200 dark:border-zinc-800" {...dom(props)} />
          ),
          a: ({ href, ...props }) => {
            const isExternal = /^https?:\/\//.test(href ?? "");
            return (
              <a
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                {...dom(props)}
              />
            );
          },
          strong: (props) => (
            <strong
              className="font-semibold text-zinc-900 dark:text-zinc-100"
              {...dom(props)}
            />
          ),
          pre: (props) => (
            <pre
              className="my-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-800"
              {...dom(props)}
            />
          ),
          code: ({ className: codeClassName, children: codeChildren, ...props }) => {
            const isBlock =
              /language-/.test(codeClassName ?? "") ||
              String(codeChildren).includes("\n");

            if (isBlock) {
              // `pre` already provides the card; keep the block code plain.
              return (
                <code className={codeClassName} {...dom(props)}>
                  {codeChildren}
                </code>
              );
            }

            return (
              <code
                className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                {...dom(props)}
              >
                {codeChildren}
              </code>
            );
          },
          table: (props) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...dom(props)} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-left font-semibold dark:border-zinc-700 dark:bg-zinc-800"
              {...dom(props)}
            />
          ),
          td: (props) => (
            <td
              className="border border-zinc-200 px-3 py-2 dark:border-zinc-700"
              {...dom(props)}
            />
          ),
          img: ({ alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="my-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
              alt={alt ?? ""}
              {...dom(props)}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
