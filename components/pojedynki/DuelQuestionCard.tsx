"use client";

import { QuizEquation } from "@/components/minigry/QuizEquation";
import type { CompareSide } from "@/lib/minigry/questions/types";
import type { DuelQuestion } from "@/lib/pojedynki/duel-types";
import { motion } from "framer-motion";

type DuelQuestionCardProps = {
  question: DuelQuestion;
  answerClass: string;
  disabled?: boolean;
  onAnswer: (value: number | boolean | string) => void;
};

/**
 * Prezentacja pojedynczego pytania pojedynku — obsługuje 3 tryby pytań
 * (choice / true-false / compare) tak samo jak minigry, ale woła `onAnswer`.
 */
export function DuelQuestionCard({
  question,
  answerClass,
  disabled = false,
  onAnswer,
}: DuelQuestionCardProps) {
  const answerBtn = `min-h-[68px] rounded-2xl border bg-surface font-black text-foreground shadow-lg transition-colors hover:bg-foreground/5 disabled:opacity-60 sm:min-h-[76px] ${answerClass}`;

  if (question.kind === "choice") {
    const q = question.q;
    return (
      <>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          {q.prompt}
        </p>
        <QuizEquation
          content={q.headline}
          as="div"
          className="mt-4 flex max-w-full flex-wrap items-center justify-center gap-x-[0.12em] break-words text-3xl font-black leading-tight text-foreground sm:text-4xl md:text-5xl"
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          {q.options.map((opt) => (
            <motion.button
              key={`${q.id}-${opt}`}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(opt)}
              className={`${answerBtn} text-2xl sm:text-3xl`}
              whileHover={disabled ? undefined : { scale: 1.04 }}
              whileTap={disabled ? undefined : { scale: 0.96 }}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </>
    );
  }

  if (question.kind === "true-false") {
    const q = question.q;
    return (
      <>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          Czy to prawda?
        </p>
        <QuizEquation
          content={q.equation}
          as="div"
          className="mt-4 flex max-w-full flex-wrap items-center justify-center gap-x-[0.12em] break-words text-2xl font-black leading-tight text-foreground sm:text-3xl md:text-4xl"
        />
        <div className="mt-8 grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(false)}
            className="flex min-h-[68px] items-center justify-center gap-2 rounded-2xl bg-red-600 text-lg font-black text-foreground shadow-lg shadow-red-600/50 disabled:opacity-60 sm:min-h-[76px] sm:text-xl"
            whileHover={disabled ? undefined : { scale: 1.05 }}
            whileTap={disabled ? undefined : { scale: 0.95 }}
          >
            ✖️ FAŁSZ
          </motion.button>
          <motion.button
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(true)}
            className="flex min-h-[68px] items-center justify-center gap-2 rounded-2xl bg-success text-lg font-black text-on-accent shadow-lg shadow-success/40 disabled:opacity-60 sm:min-h-[76px] sm:text-xl"
            whileHover={disabled ? undefined : { scale: 1.05 }}
            whileTap={disabled ? undefined : { scale: 0.95 }}
          >
            ✔️ PRAWDA
          </motion.button>
        </div>
      </>
    );
  }

  const q = question.q;
  const options: { id: CompareSide; label: string; sub: string }[] = [
    { id: "left", label: "◀ Lewa", sub: "Lewa większa" },
    { id: "equal", label: "= Równe", sub: "Równe" },
    { id: "right", label: "Prawa ▶", sub: "Prawa większa" },
  ];
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">
        Która strona jest większa?
      </p>
      <div className="mt-6 flex items-center justify-center gap-4 sm:gap-8">
        <QuizEquation
          content={q.left}
          className="inline-flex items-center text-4xl font-black text-foreground sm:text-5xl"
        />
        <span className="text-2xl font-black text-muted">vs</span>
        <QuizEquation
          content={q.right}
          className="inline-flex items-center text-4xl font-black text-foreground sm:text-5xl"
        />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {options.map(({ id, label, sub }) => (
          <motion.button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(id)}
            className={`${answerBtn} px-4 py-3 text-lg sm:text-xl`}
            whileHover={disabled ? undefined : { scale: 1.03 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
          >
            <span className="block">{label}</span>
            <span className="mt-1 block text-xs font-semibold text-muted">
              {sub}
            </span>
          </motion.button>
        ))}
      </div>
    </>
  );
}
