"use client";

import { ContentImage } from "@/components/baza-zadan/ContentImage";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import { normalizeAbcdLayout } from "@/lib/baza-zadan/cke/format-abcd-layout";
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
    () =>
      splitTaskContent(
        // Opcje ABCD w osobnych liniach (markdown inaczej skleja je w jeden akapit).
        normalizeAbcdLayout(formatCkeMathText(tresc)),
      ),
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
