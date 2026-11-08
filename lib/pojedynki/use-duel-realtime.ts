"use client";

import { getSupabaseOrNull } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  DuelConfig,
  DuelProgress,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import { DUEL_REALTIME_ENABLED, duelRoomCode } from "@/lib/pojedynki/duel-config";
import { useCallback, useEffect, useRef, useState } from "react";

export type DuelRealtimeStatus =
  | "idle"
  | "unavailable"
  | "connecting"
  | "waiting"
  | "ready"
  | "started"
  | "error";

export type DuelRealtimeRole = "host" | "guest";

type RealtimeProgressPayload = DuelProgress & { from: string };
type RealtimeResultPayload = DuelResult & { from: string };

function randomClientId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Pokój pojedynku w czasie rzeczywistym oparty o Supabase Realtime (broadcast
 * + presence). Host tworzy pokój (kod z seeda), gość dołącza po kodzie, a host
 * rozsyła konfigurację (ten sam seed → identyczne pytania). Postęp i wynik
 * przesyłane są broadcastem.
 *
 * Gdy Supabase nie jest skonfigurowany lub flaga wyłączona - `available`
 * jest false, a UI proponuje tryby offline (kod/lokalny/bot).
 */
export function useDuelRealtime(myName: string) {
  const available = DUEL_REALTIME_ENABLED && getSupabaseOrNull() !== null;

  const [status, setStatus] = useState<DuelRealtimeStatus>(
    available ? "idle" : "unavailable",
  );
  const [role, setRole] = useState<DuelRealtimeRole | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [config, setConfig] = useState<DuelConfig | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentPresent, setOpponentPresent] = useState(false);
  const [opponentProgress, setOpponentProgress] =
    useState<DuelProgress | null>(null);
  const [opponentResult, setOpponentResult] = useState<DuelResult | null>(null);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientIdRef = useRef<string>(randomClientId());
  const roleRef = useRef<DuelRealtimeRole | null>(null);
  const configRef = useRef<DuelConfig | null>(null);
  const nameRef = useRef<string>(myName);

  useEffect(() => {
    nameRef.current = myName;
  }, [myName]);

  const teardown = useCallback(() => {
    const supabase = getSupabaseOrNull();
    if (channelRef.current && supabase) {
      void supabase.removeChannel(channelRef.current);
    }
    channelRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  const attachHandlers = useCallback((channel: RealtimeChannel) => {
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const members = Object.values(state).flat() as Array<{
        clientId?: string;
        name?: string;
        role?: DuelRealtimeRole;
      }>;
      const others = members.filter(
        (m) => m.clientId !== clientIdRef.current,
      );
      const opponent = others[0];
      setOpponentPresent(others.length > 0);
      setOpponentName(opponent?.name ?? null);

      // Host rozsyła konfigurację, gdy pojawia się gość.
      if (
        roleRef.current === "host" &&
        others.length > 0 &&
        configRef.current
      ) {
        void channel.send({
          type: "broadcast",
          event: "config",
          payload: configRef.current,
        });
        setStatus("ready");
      }
    });

    channel.on("broadcast", { event: "hello" }, () => {
      if (roleRef.current === "host" && configRef.current) {
        void channel.send({
          type: "broadcast",
          event: "config",
          payload: configRef.current,
        });
      }
    });

    channel.on("broadcast", { event: "config" }, ({ payload }) => {
      const incoming = payload as DuelConfig;
      configRef.current = incoming;
      setConfig(incoming);
      if (roleRef.current === "guest") setStatus("ready");
    });

    channel.on("broadcast", { event: "start" }, ({ payload }) => {
      const { startAt: at } = payload as { startAt: number };
      setStartAt(at);
      setStatus("started");
    });

    channel.on("broadcast", { event: "progress" }, ({ payload }) => {
      const p = payload as RealtimeProgressPayload;
      if (p.from === clientIdRef.current) return;
      setOpponentProgress({
        answered: p.answered,
        correct: p.correct,
        score: p.score,
        finished: p.finished,
      });
    });

    channel.on("broadcast", { event: "result" }, ({ payload }) => {
      const r = payload as RealtimeResultPayload;
      if (r.from === clientIdRef.current) return;
      setOpponentResult({
        score: r.score,
        correct: r.correct,
        total: r.total,
        durationMs: r.durationMs,
      });
    });
  }, []);

  const subscribe = useCallback(
    (channel: RealtimeChannel, asRole: DuelRealtimeRole) => {
      channel.subscribe((subStatus) => {
        const s = String(subStatus);
        if (s === "SUBSCRIBED") {
          void channel.track({
            clientId: clientIdRef.current,
            name: nameRef.current,
            role: asRole,
          });
          if (asRole === "guest") {
            void channel.send({
              type: "broadcast",
              event: "hello",
              payload: { from: clientIdRef.current },
            });
          }
          setStatus("waiting");
        } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
          setError("Problem z połączeniem w czasie rzeczywistym.");
          setStatus("error");
        }
      });
    },
    [],
  );

  const createRoom = useCallback(
    (newConfig: DuelConfig): string | null => {
      const supabase = getSupabaseOrNull();
      if (!supabase || !available) {
        setStatus("unavailable");
        return null;
      }
      teardown();
      const newCode = duelRoomCode(newConfig);
      roleRef.current = "host";
      configRef.current = newConfig;
      setRole("host");
      setCode(newCode);
      setConfig(newConfig);
      setStatus("connecting");
      setError(null);

      const channel = supabase.channel(`pojedynek:${newCode}`, {
        config: { presence: { key: clientIdRef.current } },
      });
      channelRef.current = channel;
      attachHandlers(channel);
      subscribe(channel, "host");
      return newCode;
    },
    [available, attachHandlers, subscribe, teardown],
  );

  const joinRoom = useCallback(
    (joinCode: string) => {
      const supabase = getSupabaseOrNull();
      if (!supabase || !available) {
        setStatus("unavailable");
        return;
      }
      const normalized = joinCode.trim().toUpperCase();
      if (!normalized) {
        setError("Podaj kod pokoju.");
        return;
      }
      teardown();
      roleRef.current = "guest";
      setRole("guest");
      setCode(normalized);
      setStatus("connecting");
      setError(null);

      const channel = supabase.channel(`pojedynek:${normalized}`, {
        config: { presence: { key: clientIdRef.current } },
      });
      channelRef.current = channel;
      attachHandlers(channel);
      subscribe(channel, "guest");
    },
    [available, attachHandlers, subscribe, teardown],
  );

  const startMatch = useCallback(() => {
    const channel = channelRef.current;
    if (!channel || roleRef.current !== "host") return;
    const at = Date.now() + 3200;
    void channel.send({
      type: "broadcast",
      event: "start",
      payload: { startAt: at },
    });
    setStartAt(at);
    setStatus("started");
  }, []);

  const sendProgress = useCallback((progress: DuelProgress) => {
    const channel = channelRef.current;
    if (!channel) return;
    void channel.send({
      type: "broadcast",
      event: "progress",
      payload: { ...progress, from: clientIdRef.current },
    });
  }, []);

  const sendResult = useCallback((result: DuelResult) => {
    const channel = channelRef.current;
    if (!channel) return;
    void channel.send({
      type: "broadcast",
      event: "result",
      payload: { ...result, from: clientIdRef.current },
    });
  }, []);

  const leave = useCallback(() => {
    teardown();
    roleRef.current = null;
    configRef.current = null;
    setRole(null);
    setCode(null);
    setConfig(null);
    setOpponentName(null);
    setOpponentPresent(false);
    setOpponentProgress(null);
    setOpponentResult(null);
    setStartAt(null);
    setError(null);
    setStatus(available ? "idle" : "unavailable");
  }, [available, teardown]);

  return {
    available,
    status,
    role,
    code,
    config,
    opponentName,
    opponentPresent,
    opponentProgress,
    opponentResult,
    startAt,
    error,
    createRoom,
    joinRoom,
    startMatch,
    sendProgress,
    sendResult,
    leave,
  };
}
