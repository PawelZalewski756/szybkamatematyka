"use client";

import { createDuelConfig } from "@/lib/pojedynki/duel-config";
import { resolveDuel } from "@/lib/pojedynki/duel-engine";
import {
  decodeChallenge,
  encodeChallenge,
  rememberChallenge,
  type DuelChallengePayload,
} from "@/lib/pojedynki/duel-storage";
import {
  createDuelRoom,
  fetchDuelRoom,
  submitGuestResult,
} from "@/lib/pojedynki/duel-rooms";
import { duelMinigameTitle } from "@/lib/pojedynki/duel-questions";
import type {
  DuelConfig,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { DuelArena } from "@/components/pojedynki/DuelArena";
import { DuelResultScreen } from "@/components/pojedynki/DuelResultScreen";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LearningPath } from "@/lib/learning-path";
import { useCallback, useMemo, useState } from "react";

type ChallengeDuelProps = {
  slug: string;
  path: LearningPath;
  length: number;
  playerName: string;
  onExit: () => void;
};

type Stage =
  | "menu"
  | "createPlay"
  | "createShare"
  | "acceptInput"
  | "acceptPlay"
  | "acceptResult";

export function ChallengeDuel({
  slug,
  path,
  length,
  playerName,
  onExit,
}: ChallengeDuelProps) {
  const [stage, setStage] = useState<Stage>("menu");
  const [seedKey, setSeedKey] = useState(0);

  const createConfig = useMemo<DuelConfig>(
    () => createDuelConfig({ slug, path, questionCount: length }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, path, length, seedKey],
  );

  const [hostResult, setHostResult] = useState<DuelResult | null>(null);
  const [portableCode, setPortableCode] = useState<string>("");
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Accept flow
  const [inputCode, setInputCode] = useState("");
  const [accepted, setAccepted] = useState<DuelChallengePayload | null>(null);
  const [acceptedRoomCode, setAcceptedRoomCode] = useState<string | null>(null);
  const [myResult, setMyResult] = useState<DuelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = duelMinigameTitle(slug);
  const supabaseOn = isSupabaseConfigured();

  const finalizeHost = useCallback(
    async (result: DuelResult) => {
      const payload: DuelChallengePayload = {
        v: 1,
        config: createConfig,
        hostName: playerName,
        hostResult: result,
      };
      const code = encodeChallenge(payload);
      setHostResult(result);
      setPortableCode(code);
      rememberChallenge(payload);

      // Best-effort: zapis krótkiego kodu w Supabase (cross-device).
      const room = await createDuelRoom(createConfig, playerName, result);
      setShortCode(room ?? null);
      setStage("createShare");
    },
    [createConfig, playerName],
  );

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, []);

  const resolveCode = useCallback(async () => {
    setError(null);
    const raw = inputCode.trim();
    if (!raw) {
      setError("Wklej kod wyzwania albo podaj kod pokoju.");
      return;
    }

    // 1) Przenośny kod offline (SMD1.…)
    const portable = decodeChallenge(raw);
    if (portable) {
      setAccepted(portable);
      setAcceptedRoomCode(null);
      setStage("acceptPlay");
      return;
    }

    // 2) Krótki kod pokoju w Supabase
    setLoading(true);
    const room = await fetchDuelRoom(raw);
    setLoading(false);
    if (room && room.hostResult) {
      setAccepted({
        v: 1,
        config: room.config,
        hostName: room.hostName,
        hostResult: room.hostResult,
      });
      setAcceptedRoomCode(room.code);
      setStage("acceptPlay");
      return;
    }

    setError(
      "Nie rozpoznano kodu. Sprawdź, czy wkleiłeś pełny kod wyzwania lub poprawny kod pokoju.",
    );
  }, [inputCode]);

  const finalizeGuest = useCallback(
    async (result: DuelResult) => {
      setMyResult(result);
      if (acceptedRoomCode) {
        void submitGuestResult(acceptedRoomCode, playerName, result);
      }
      setStage("acceptResult");
    },
    [acceptedRoomCode, playerName],
  );

  const restartCreate = useCallback(() => {
    setHostResult(null);
    setPortableCode("");
    setShortCode(null);
    setSeedKey((k) => k + 1);
    setStage("createPlay");
  }, []);

  // ----- RENDER -----

  if (stage === "menu") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">
          {title} · Wyzwanie
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          Pojedynek na kod
        </h1>
        <p className="mt-3 max-w-md text-zinc-400">
          Zagraj i wyślij znajomemu kod, albo wklej kod, który dostałeś. Ten sam
          zestaw pytań, porównanie wyników — działa nawet offline.
        </p>
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStage("createPlay")}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 px-6 py-5 text-lg font-black text-white shadow-lg shadow-cyan-500/30"
          >
            🎯 Stwórz wyzwanie
          </button>
          <button
            type="button"
            onClick={() => setStage("acceptInput")}
            className="rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-5 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30"
          >
            📥 Mam kod
          </button>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="mt-6 text-sm font-semibold text-zinc-500 hover:text-fuchsia-400"
        >
          ← Zmień tryb
        </button>
        {!supabaseOn && (
          <p className="mt-4 text-xs text-zinc-600">
            Tryb offline: kody przenośne działają bez konta i internetu.
          </p>
        )}
      </div>
    );
  }

  if (stage === "createPlay") {
    return (
      <DuelArena
        config={createConfig}
        playerName={playerName}
        opponent={{ name: "Znajomy (rywal)", kind: "ghost" }}
        opponentPending="Zagra Twój kod później"
        onFinish={(r) => void finalizeHost(r)}
      />
    );
  }

  if (stage === "createShare") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-6xl">📨</p>
        <h1 className="mt-3 text-3xl font-black text-white">
          Wyzwanie gotowe!
        </h1>
        <p className="mt-2 text-zinc-400">
          Twój wynik:{" "}
          <span className="font-black text-amber-400">
            🏆 {hostResult?.score ?? 0}
          </span>{" "}
          ({hostResult?.correct ?? 0}/{hostResult?.total ?? 0})
        </p>

        {shortCode && (
          <div className="mt-6 w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Krótki kod pokoju
            </p>
            <p className="mt-1 text-4xl font-black tracking-[0.3em] text-white">
              {shortCode}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Znajomy wpisuje ten kod w „Mam kod”.
            </p>
          </div>
        )}

        <div className="mt-5 w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Kod przenośny (offline)
          </p>
          <textarea
            readOnly
            value={portableCode}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 h-24 w-full resize-none rounded-xl border border-white/10 bg-zinc-900 p-3 text-xs text-zinc-300"
          />
        </div>

        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void copyToClipboard(portableCode)}
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 text-lg font-black text-white shadow-lg"
          >
            {copied ? "Skopiowano ✓" : "Kopiuj kod"}
          </button>
          <button
            type="button"
            onClick={restartCreate}
            className="flex-1 rounded-2xl border border-white/20 px-6 py-4 text-lg font-black text-white hover:bg-white/5"
          >
            Zagraj jeszcze raz
          </button>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 text-sm font-semibold text-zinc-500 hover:text-fuchsia-400"
        >
          ← Zmień tryb
        </button>
      </div>
    );
  }

  if (stage === "acceptInput") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">
          Dołącz do wyzwania
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Wklej kod</h1>
        <p className="mt-3 max-w-md text-zinc-400">
          Wklej długi kod przenośny albo wpisz krótki kod pokoju.
        </p>
        <textarea
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="SMD1.… lub np. K7M2P"
          className="mt-6 h-28 w-full resize-none rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-fuchsia-500/50 focus:outline-none"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={() => void resolveCode()}
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 py-5 text-xl font-black text-white shadow-xl shadow-fuchsia-500/40 disabled:opacity-60"
        >
          {loading ? "Szukam…" : "Zagraj wyzwanie"}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 text-sm font-semibold text-zinc-500 hover:text-fuchsia-400"
        >
          ← Zmień tryb
        </button>
      </div>
    );
  }

  if (stage === "acceptPlay" && accepted) {
    return (
      <DuelArena
        config={accepted.config}
        playerName={playerName}
        opponent={{ name: accepted.hostName, kind: "ghost" }}
        opponentProgress={{
          answered: accepted.hostResult.total,
          correct: accepted.hostResult.correct,
          score: accepted.hostResult.score,
          finished: true,
        }}
        onFinish={(r) => void finalizeGuest(r)}
      />
    );
  }

  if (stage === "acceptResult" && accepted && myResult) {
    return (
      <DuelResultScreen
        outcome={resolveDuel(myResult, accepted.hostResult)}
        myName={playerName}
        opponent={{ name: accepted.hostName, kind: "ghost" }}
        myResult={myResult}
        opponentResult={accepted.hostResult}
        slug={accepted.config.slug}
        mode="challenge"
        onRematch={() => {
          setMyResult(null);
          setStage("acceptPlay");
        }}
      />
    );
  }

  return null;
}
