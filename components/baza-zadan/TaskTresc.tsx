"use client";

import { ContentImage } from "@/components/baza-zadan/ContentImage";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import { splitTaskContent } from "@/lib/baza-zadan/cke/matura-task-content";
import { useMemo } from "react";

type TaskTrescProps = {
  tresc: string;
  className?: string;
  variant?: "task" | "solution";
};

export function TaskTresc({
  tresc,
  className = "",
  variant = "task",
}: TaskTrescProps) {
  const parts = useMemo(
    () => splitTaskContent(formatCkeMathText(tresc)),
    [tresc],
  );
  const markdownVariant = variant === "solution" ? "solution" : "default";

  return (
    <div className={`space-y-3 ${className}`}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <div key={`t-${i}`}>
              <TheoryMarkdown content={part.content} variant={markdownVariant} />
            </div>
          );
        }

        return (
          <ContentImage
            key={`i-${i}`}
            src={part.src}
            alt={part.alt}
          />
        );
      })}
    </div>
  );
}
