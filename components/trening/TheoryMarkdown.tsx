"use client";

import { ContentImage } from "@/components/baza-zadan/ContentImage";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type TheoryMarkdownProps = {
  content: string;
  variant?: "default" | "compact" | "solution";
};

const VARIANT_CLASS: Record<NonNullable<TheoryMarkdownProps["variant"]>, string> =
  {
    default:
      "prose prose-invert prose-zinc max-w-none break-words text-base sm:text-lg " +
      "prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white " +
      "prose-p:leading-relaxed prose-p:text-zinc-200 " +
      "prose-strong:text-white prose-a:text-orange-400 prose-a:no-underline hover:prose-a:text-amber-400 " +
      "prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-orange-400 " +
      "prose-pre:border prose-pre:border-white/10 prose-pre:bg-zinc-950/80 " +
      "prose-li:text-zinc-200 prose-blockquote:border-orange-500/30 prose-blockquote:text-zinc-300 " +
      "[&_.katex-display]:my-4 [&_.katex]:text-zinc-100",
    compact:
      "prose prose-sm prose-invert prose-zinc max-w-none break-words " +
      "prose-p:leading-relaxed prose-p:text-zinc-300 prose-strong:text-zinc-100 " +
      "[&_.katex-display]:my-2 [&_.katex]:text-zinc-100",
    solution:
      "prose prose-sm prose-invert prose-zinc max-w-none break-words " +
      "prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-zinc-200 " +
      "prose-strong:text-emerald-100 prose-li:text-zinc-200 " +
      "prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:text-sm " +
      "[&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto " +
      "[&_.katex]:text-zinc-100",
  };

function markdownComponents(): Components {
  return {
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;
      return <ContentImage src={src} alt={alt ?? ""} />;
    },
  };
}

export function TheoryMarkdown({
  content,
  variant = "default",
}: TheoryMarkdownProps) {
  return (
    <div className={VARIANT_CLASS[variant]}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents()}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
