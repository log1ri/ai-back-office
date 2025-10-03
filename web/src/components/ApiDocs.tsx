import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import type { TocItem } from "./MarkdownToc";
import { MarkdownToc } from "./MarkdownToc";
import CodeBlock from '../components/ui/codeblock';
import "highlight.js/styles/stackoverflow-light.css";
import "github-markdown-css/github-markdown-light.css";

export default function ApiDocs({mdURL}: {mdURL: string}) {
  const [content, setContent] = useState("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const articleRef = useRef<HTMLElement>(null);

  // Fetch markdown content
  useEffect(() => {
    (async () => {
      const res = await fetch(mdURL, { cache: "no-store" });
      const text = await res.text();
      setContent(text);
    })();
  }, []);

  // save TOC after markdown was rendered
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const hs = Array.from(el.querySelectorAll<HTMLElement>("h2, h3"));
    const items: TocItem[] = hs
      .filter(h => h.id)
      .map(h => ({
        id: h.id,
        text: (h.innerText || h.textContent || "").trim(),
        level: Number(h.tagName.replace("H", "")),
      }));
    setToc(items);
  }, [content]);

  return (
    <div className="flex flex-col justify-between ">
      <article
        ref={articleRef}  
        className="markdown-body !text-black !py-6 !px-20 w-[75%] font-[system-ui] !bg-white  dark:!bg-background dark:!text-foreground"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]} 
          components={{
            h1: ({ node, ...props }) => (
                <h1
                    {...props}
                    className="!font-bold mt-4 !mb-2 scroll-mt-20 relative w-full 
                    !border-b-0    
                    after:content-[''] after:block after:h-[3px] after:mt-6 after:mb-1   
                    after:bg-gradient-to-r after:from-[#7b64ea] after:to-[#c3fb55]"
                />
            ),
            h2: ({ node, ...props }) => (
              <h2 {...props} className="!font-bold !mt-8 !mb-4 scroll-mt-20 !border-none" />
            ),
            h3: ({ node, ...props }) => (
              <h3 {...props} className="font-semibold mt-4 mb-2 scroll-mt-20" />
            ),
            p:  ({ node, ...props }) => <p {...props} className="!mt-2 !mb-4 " />,
            ul: ({ node, ...props }) => 
                (<ul {...props} className="list-none pl-6 space-y-2" />
            ),
            li: ({ node, ...props }) => (
                <li {...props} className="relative !pl-6 before:content-['●'] before:absolute before:left-0 before:text-[#7b64ea] dark:bg-background dark:text-foreground" />
            ),
            pre: ({ node, ...props }) => (
                // CodeBlock --> CodeBlock --> CopyButton
                <CodeBlock {...props}  />
            ),
            code: ({ node, ...props }) =>(
                <code
                    {...props}
                    className="
                    !text-gray-600  dark:!text-white "        
            /> ),
            hr: ({ node, ...props }) => (
                <hr
                {...props}
                className="!my-6 !h-1 !rounded !bg-gradient-to-r from-[#7b64ea] to-[#c3fb55]"
            />),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      
  <MarkdownToc toc={toc} className="hidden xl:block w-56  dark:bg-background dark:text-foreground" topOffset={80} />
    </div>
  );
}
