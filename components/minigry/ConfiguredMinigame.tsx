"use client";

import { MinigameShell } from "@/components/minigry/MinigameShell";
import { MathText } from "@/components/trening/MathText";
import { formatNumericAnswer } from "@/lib/minigry/format-answer";
import { getMinigameBySlug } from "@/lib/minigry/minigame-registry";
import { getGameVisual } from "@/components/minigry/minigame-visuals";
import { pickUnseenQuestion } from "@/lib/minigry/question-picker";
import { type MinigamePlayMode } from "@/lib/minigry/game-modes";
import type {
  ChoiceQuestion,
  ChoiceValue,
  CompareQuestion,
  CompareSide,
  TrueFalseQuestion,
} from "@/lib/minigry/questions/types";
import { loadLearningPath, type LearningPath } from "@/lib/learning-path";
import { useMinigameSession } from "@/lib/minigry/use-minigame-session";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

type PlayerQuestion = NonNullable<ReturnType<typeof createQuestion>>;

/** Dzieli długie równanie na dwie linie po znaku "=". */
function splitEquation(equation: string): [string, string] | null {
  const match = equation.match(/^\$([\s\S]+)\$$/);
  if (!match) return null;
  const body = match[1];
  const index = body.indexOf("=");
  if (index <= 0 || index >= body.length - 1) return null;
  return [
    `$${body.slice(0, index).trim()}$`,
    `$= ${body.slice(index + 1).trim()}$`,
  ];
}

/** Wzory skalują się razem z szerokością ekranu, żeby nie ucinały się na telefonie. */
function mathSizeClass(text: string): string {
  if (text.length > 60) return "text-[clamp(0.85rem,3.6vw,1.4rem)]";
  if (text.length > 46) return "text-[clamp(0.9rem,3.9vw,1.55rem)]";
  if (text.length > 34) return "text-[clamp(0.95rem,4.3vw,1.7rem)]";
  return "text-[clamp(1.1rem,5vw,1.9rem)]";
}

export function ConfiguredMinigame({
  slug,
  mode = "time_attack",
}: ConfiguredMinigameProps) {
  const def = getMinigameBySlug(slug);
  const session = useMinigameSession(mode);
  const { path, registerCorrect, registerWrong, phase, setTimerPaused } = session;

  const seenRef = useRef<Set<string>>(new Set());

  const makeQuestion = useCallback(
    (fresh = false): PlayerQuestion | null => {
      if (fresh) seenRef.current = new Set();
      if (!createQuestion(slug, path)) return null;
      return pickUnseenQuestion(() => {
        const next = createQuestion(slug, path);
        if (!next) throw new Error("Minigra nie istnieje.");
        return { id: next.q.id, value: next };
      }, seenRef.current).value;
    },
    [slug, path],
  );

  const [question, setQuestion] = useState<PlayerQuestion | null>(() =>
    createQuestion(slug, loadLearningPath()),
  );

  useEffect(() => {
    if (question) seenRef.current.add(question.q.id);
  }, [question]);

  const [feedback, setFeedback] = useState<{
    correct: boolean;
    answer: ReactNode;
  } | null>(null);
  const [picked, setPicked] = useState<string | number | boolean | null>(null);
  const answerLocked = feedback !== null;

  const answerStateClass = (isCorrect: boolean, isPicked: boolean): string => {
    if (!feedback) return "";
    if (isCorrect) return "!border-success !bg-success/15";
    if (isPicked) return "!border-danger !bg-danger/15";
    return "opacity-60";
  };

  const nextQuestion = useCallback(() => {
    setPicked(null);
    setQuestion(makeQuestion());
  }, [makeQuestion]);

  const restartQuestions = useCallback(() => {
    setPicked(null);
    setQuestion(makeQuestion(true));
  }, [makeQuestion]);

  const revealAndAdvance = useCallback(
    (correct: boolean, answer: ReactNode) => {
      setFeedback({ correct, answer });
      setTimerPaused(true);
      window.setTimeout(
        () => {
          setFeedback(null);
          setTimerPaused(false);
          nextQuestion();
        },
        correct ? 700 : 1500,
      );
    },
    [nextQuestion, setTimerPaused],
  );

  useEffect(() => {
    if (phase === "start") {
      // Nowe pytanie i czysta pamięć powtórek przy powrocie do ekranu startu.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestion(makeQuestion(true));
      setFeedback(null);
      setTimerPaused(false);
    }
  }, [makeQuestion, phase, setTimerPaused]);

  if (!def) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-xl font-black text-foreground">Nie ma takiej minigry</p>
        <Link href="/minigry" className="mt-6 text-accent hover:underline">
          ← Wróć do listy
        </Link>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted">
        Ładowanie…
      </div>
    );
  }

  const answerBtn = `min-h-[64px] rounded-xl border bg-surface text-lg font-semibold text-foreground transition-colors hover:bg-surface-hover sm:min-h-[72px] sm:text-xl ${def.answerClass}`;

  const answerLabel = (value: ChoiceValue): ReactNode =>
    typeof value === "number" ? (
      formatNumericAnswer(value)
    ) : (
      <MathText content={value} className="[&_.katex]:text-[1em]" />
    );

  const submitAnswer = (correct: boolean, answer: ReactNode) => {
    if (answerLocked) return;
    if (correct) registerCorrect(() => revealAndAdvance(true, answer));
    else registerWrong(() => revealAndAdvance(false, answer));
  };

  const handleChoice = (value: ChoiceValue) => {
    if (question.mode !== "choice") return;
    setPicked(value);
    submitAnswer(value === question.q.correct, answerLabel(question.q.correct));
  };

  const handleTf = (playerSaysTrue: boolean) => {
    if (question.mode !== "true-false") return;
    setPicked(playerSaysTrue);
    submitAnswer(
      playerSaysTrue === question.q.isCorrect,
      question.q.isCorrect ? "Prawda" : "Fałsz",
    );
  };

  const handleCompare = (side: CompareSide) => {
    if (question.mode !== "compare") return;
    setPicked(side);
    const labels: Record<CompareSide, string> = {
      left: "Lewa większa",
      right: "Prawa większa",
      equal: "Równe",
    };
    submitAnswer(side === question.q.correct, labels[question.q.correct]);
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
      <MathText
        content={q.headline}
        as="div"
        className={`mt-4 max-w-full break-words font-bold leading-tight text-foreground [&_.katex]:text-[1em] ${mathSizeClass(
          q.headline,
        )}`}
      />
    );
    answers = (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {q.options.map((opt) => (
          <motion.button
            key={`${q.id}-${opt}`}
            type="button"
            onClick={() => handleChoice(opt)}
            className={`${answerBtn} tabular-nums ${answerStateClass(
              opt === q.correct,
              picked === opt,
            )}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {typeof opt === "number" ? (
              formatNumericAnswer(opt)
            ) : (
              <MathText
                content={opt}
                className="[&_.katex]:text-[1em]"
              />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  if (question.mode === "true-false") {
    const q = question.q;
    questionKey = q.id;
    questionPrompt = "Czy to prawda?";
    const equationParts =
      q.equation.length >= 30 ? splitEquation(q.equation) : null;

    questionContent = equationParts ? (
      <div className="mt-4 max-w-full font-bold leading-tight text-foreground [&_.katex]:text-[1em] text-[clamp(1rem,4.6vw,1.75rem)]">
        <span className="block">
          <MathText content={equationParts[0]} />
        </span>
        <span className="mt-1 block">
          <MathText content={equationParts[1]} />
        </span>
      </div>
    ) : (
      <MathText
        content={q.equation}
        as="div"
        className={`mt-4 max-w-full break-words font-bold leading-tight text-foreground [&_.katex]:text-[1em] ${mathSizeClass(
          q.equation,
        )}`}
      />
    );
    answers = (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <motion.button
          type="button"
          onClick={() => handleTf(false)}
          className={`flex min-h-[64px] items-center justify-center rounded-xl bg-danger text-base font-semibold text-foreground sm:min-h-[72px] sm:text-lg ${answerStateClass(
            q.isCorrect === false,
            picked === false,
          )}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Fałsz
        </motion.button>
        <motion.button
          type="button"
          onClick={() => handleTf(true)}
          className={`flex min-h-[64px] items-center justify-center rounded-xl bg-success text-base font-semibold text-background sm:min-h-[72px] sm:text-lg ${answerStateClass(
            q.isCorrect === true,
            picked === true,
          )}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Prawda
        </motion.button>
      </div>
    );
  }

  if (question.mode === "compare") {
    const q = question.q;
    questionKey = q.id;
    questionPrompt = "Która wartość jest większa?";
    questionContent = (
      <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6">
        <MathText
          content={q.left}
          className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl [&_.katex]:text-[1em]"
        />
        <span className="text-lg font-medium text-muted">czy</span>
        <MathText
          content={q.right}
          className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl [&_.katex]:text-[1em]"
        />
      </div>
    );
    answers = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(
          [
            { id: "left" as const, label: "Lewa większa" },
            { id: "equal" as const, label: "Równe" },
            { id: "right" as const, label: "Prawa większa" },
          ] as const
        ).map(({ id, label }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => handleCompare(id)}
            className={`${answerBtn} px-4 ${answerStateClass(
              id === q.correct,
              picked === id,
            )}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    );
  }


  const feedbackNode = feedback ? (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
        feedback.correct
          ? "border-success/40 bg-success/10"
          : "border-accent/40 bg-accent-soft"
      }`}
    >
      <span
        className={`mt-0.5 text-lg leading-none ${
          feedback.correct ? "text-success" : "text-accent"
        }`}
        aria-hidden
      >
        {feedback.correct ? "✓" : "!"}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">
          {feedback.correct ? "Dobrze!" : "Poprawna odpowiedź"}
        </p>
        {!feedback.correct ? (
          <p className="mt-0.5 text-sm text-foreground">{feedback.answer}</p>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <MinigameShell
      title={def.title}
      hudTitle={getGameVisual({ id: def.slug }).label}
      description={def.description}
      theme={def.theme}
      session={session}
      onStart={restartQuestions}
      onPlayAgain={restartQuestions}
      questionKey={questionKey}
      questionPrompt={questionPrompt}
      questionContent={questionContent}
      answers={answers}
      feedback={feedbackNode}
      answersDisabled={answerLocked}
    />
  );
}
