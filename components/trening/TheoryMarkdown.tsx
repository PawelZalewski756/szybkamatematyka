"use client";

import { ContentImage } from "@/components/baza-zadan/ContentImage";
import { slugifyHeading } from "@/lib/trening/theory-content";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { isValidElement, type ReactNode } from "react";

type TheoryMarkdownProps = {
  content: string;
  variant?: "default" | "compact" | "solution";
};

const VARIANT_CLASS: Record<NonNullable<TheoryMarkdownProps["variant"]>, string> =
  {
    default:
      "prose prose-invert max-w-none break-words text-base sm:text-lg " +
      "prose-headings:font-semibold prose-headings:text-foreground " +
      "prose-headings:scroll-mt-24 prose-p:leading-relaxed prose-p:text-foreground/95 " +
      "prose-strong:text-foreground prose-a:text-foreground prose-a:underline hover:prose-a:text-brand-light " +
      "prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:text-foreground " +
      "prose-pre:border prose-pre:border-surface-border prose-pre:bg-surface " +
      "prose-li:text-foreground/95 prose-blockquote:border-surface-border prose-blockquote:text-muted " +
      "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex]:text-foreground " +
      "[&_.katex-display>.katex]:inline-block [&_.katex-display>.katex]:max-w-none",
    compact:
      "prose prose-sm prose-invert max-w-none break-words " +
      "prose-p:leading-relaxed prose-p:text-foreground/90 prose-strong:text-foreground " +
      "[&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto [&_.katex]:text-foreground " +
      "[&_.katex-display>.katex]:inline-block [&_.katex-display>.katex]:max-w-none",
    solution:
      "prose prose-sm prose-invert max-w-none break-words " +
      "prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-foreground/90 " +
      "prose-strong:text-success prose-li:text-foreground/90 " +
      "prose-headings:text-foreground prose-headings:font-bold prose-headings:text-sm " +
      "[&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto [&_.katex]:text-foreground " +
      "[&_.katex-display>.katex]:inline-block [&_.katex-display>.katex]:max-w-none",
  };

function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenText(node.props.children);
  }
  return "";
}

function markdownComponents(withAnchors: boolean): Components {
  const heading =
    (Tag: "h2" | "h3") => {
      function Heading({ children }: { children?: ReactNode }) {
        const text = flattenText(children);
        const id = withAnchors ? slugifyHeading(text) : undefined;
        return (
          <Tag id={id} className={withAnchors ? "scroll-mt-24" : undefined}>
            {children}
          </Tag>
        );
      }
      Heading.displayName = Tag === "h2" ? "MarkdownH2" : "MarkdownH3";
      return Heading;
    };

  return {
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;
      return <ContentImage src={src} alt={alt ?? ""} />;
    },
    ...(withAnchors
      ? {
          h2: heading("h2"),
          h3: heading("h3"),
        }
      : {}),
  };
}

export function TheoryMarkdown({
  content,
  variant = "default",
}: TheoryMarkdownProps) {
  const withAnchors = variant === "default";

  return (
    <div className={VARIANT_CLASS[variant]}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents(withAnchors)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
