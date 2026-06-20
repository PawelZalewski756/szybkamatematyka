"use client";

import { MinigameShell } from "@/components/minigry/MinigameShell";
import { getMinigameBySlug } from "@/lib/minigry/minigame-registry";
import { type MinigamePlayMode } from "@/lib/minigry/game-modes";
import type {
  ChoiceQuestion,
  CompareQuestion,
  CompareSide,
  TrueFalseQuestion,
} from "@/lib/minigry/questions/types";
import { loadLearningPath, type LearningPath } from "@/lib/learning-path";
import { useMinigameSession } from "@/lib/minigry/use-minigame-session";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ConfiguredMinigameProps = {
  slug: string;
  mode?: MinigamePlayMode;
};

function createQuestion(
  slug: string,
  path: LearningPath,
):
  | { mode: "choice"; q: ChoiceQuestion }
  | { mode: "true-false"; q: TrueFalseQuestion }
  | { mode: "compare"; q: CompareQuestion }
  | null {
  const def = getMinigameBySlug(slug);
  if (!def) return null;
  const raw = def.generate(path);
  if (def.mode === "choice") return { mode: "choice", q: raw as ChoiceQuestion };
  if (def.mode === "true-false")
    return { mode: "true-false", q: raw as TrueFalseQuestion };
  return { mode: "compare", q: raw as CompareQuestion };
}

export function ConfiguredMinigame({
  slug,
  mode = "time_attack",
}: ConfiguredMinigameProps) {
  const def = getMinigameBySlug(slug);
  const session = useMinigameSession(mode);
  const { path, registerCorrect, registerWrong, phase } = session;

  const [question, setQuestion] = useState(() =>
    createQuestion(slug, loadLearningPath()),
  );

  const nextQuestion = useCallback(() => {
    setQuestion(createQuestion(slug, path));
  }, [slug, path]);

  useEffect(() => {
    if (phase === "start") {
      // Generate a fresh question whenever the game returns to the start phase.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestion(createQuestion(slug, path));
    }
  }, [slug, path, phase]);

  if (!def) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-xl font-black text-white">Nie ma takiej minigry</p>
        <Link href="/minigry" className="mt-6 text-fuchsia-400 hover:underline">
          ← Wróć do listy
        </Link>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-zinc-500">
        Ładowanie…
      </div>
    );
  }

  const answerBtn = `min-h-[72px] rounded-2xl border bg-zinc-900 font-black text-white shadow-lg transition-colors hover:bg-white/5 sm:min-h-[80px] ${def.answerClass}`;

  const handleChoice = (value: number) => {
    if (question.mode !== "choice") return;
    if (value === question.q.correct) registerCorrect(nextQuestion);
    else registerWrong(nextQuestion);
  };

  const handleTf = (playerSaysTrue: boolean) => {
    if (question.mode !== "true-false") return;
    if (playerSaysTrue === question.q.isCorrect) registerCorrect(nextQuestion);
    else registerWrong(nextQuestion);
  };

  const handleCompare = (side: CompareSide) => {
    if (question.mode !== "compare") return;
    if (side === question.q.correct) registerCorrect(nextQuestion);
    else registerWrong(nextQuestion);
  };

  let questionPrompt = "";
  let questionContent = null;
  let answers = null;
  let questionKey = "";

  if (question.mode === "choice") {
    const q = question.q;
    questionKey = q.id;
    questionPrompt = q.prompt;
    questionContent = (
      <p className="mt-4 break-words text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
        {q.headline}
      </p>
    );
    answers = (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {q.options.map((opt) => (
          <motion.button
            key={`${q.id}-${opt}`}
            type="button"
            onClick={() => handleChoice(opt)}
            className={`${answerBtn} text-2xl sm:text-3xl`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    );
  }

  if (question.mode === "true-false") {
    const q = question.q;
    questionKey = q.id;
    questionPrompt = "Czy to prawda?";
    questionContent = (
      <p className="mt-4 break-words text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
        {q.equation}
      </p>
    );
    answers = (
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          type="button"
          onClick={() => handleTf(false)}
          className="flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-600/50 sm:min-h-[80px] sm:text-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✖️ FAŁSZ
        </motion.button>
        <motion.button
          type="button"
          onClick={() => handleTf(true)}
          className="flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-600/50 sm:min-h-[80px] sm:text-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✔️ PRAWDA
        </motion.button>
      </div>
    );
  }

  if (question.mode === "compare") {
    const q = question.q;
    questionKey = q.id;
    questionPrompt = "Która strona jest większa?";
    questionContent = (
      <div className="mt-6 flex items-center justify-center gap-4 sm:gap-8">
        <span className="text-4xl font-black text-white sm:text-5xl">
          {q.left}
        </span>
        <span className="text-2xl font-black text-zinc-500">vs</span>
        <span className="text-4xl font-black text-white sm:text-5xl">
          {q.right}
        </span>
      </div>
    );
    answers = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {(
          [
            { id: "left" as const, label: "◀ Lewa", sub: "Lewa większa" },
            { id: "equal" as const, label: "= Równe", sub: "Równe" },
            { id: "right" as const, label: "Prawa ▶", sub: "Prawa większa" },
          ] as const
        ).map(({ id, label, sub }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => handleCompare(id)}
            className={`${answerBtn} px-4 py-3 text-lg sm:text-xl`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="block">{label}</span>
            <span className="mt-1 block text-xs font-semibold text-zinc-500">
              {sub}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }


  return (
    <MinigameShell
      title={def.title}
      description={def.description}
      theme={def.theme}
      session={session}
      onStart={nextQuestion}
      onPlayAgain={nextQuestion}
      questionKey={questionKey}
      questionPrompt={questionPrompt}
      questionContent={questionContent}
      answers={answers}
    />
  );
}
