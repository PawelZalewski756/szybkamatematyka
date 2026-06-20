"use client";

import {
  createProfile,
  isNickTaken,
  NickTakenError,
  normalizeNick,
  updateProfileNick,
  type Profile,
} from "@/lib/supabase/profiles";
import { notifyProfileUpdated } from "@/lib/profile-sync";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Gamepad2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

type OnboardingModalProps = {
  user: User;
  onComplete: (profile: Profile) => void;
};

export function OnboardingModal({ user, onComplete }: OnboardingModalProps) {
  const [nick, setNick] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = normalizeNick(nick);
    if (next.length < 2) {
      setError("Nick musi mieć co najmniej 2 znaki.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const taken = await isNickTaken(next, user.id);
      if (taken) {
        setError("Ten nick jest już zajęty!");
        return;
      }

      let saved: Profile;
      try {
        saved = await updateProfileNick(user.id, next);
      } catch {
        saved = await createProfile(user.id, next);
      }

      notifyProfileUpdated(saved);
      onComplete(saved);
    } catch (err) {
      if (err instanceof NickTakenError) {
        setError("Ten nick jest już zajęty!");
        return;
      }
      setError("Nie udało się zapisać nicku. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-orange-500/30 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 p-6 shadow-[0_0_60px_rgba(192,38,211,0.25)] backdrop-blur-2xl sm:p-8"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br bg-brand-gradient shadow-lg shadow-orange-500/30">
            <Gamepad2 className="h-7 w-7 text-white" aria-hidden />
          </div>
        </div>

        <h2
          id="onboarding-title"
          className="text-center text-xl font-black text-white sm:text-2xl"
        >
          Witaj w grze!
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
          Wybierz swój unikalny nick, aby dołączyć do rankingu.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6">
          <label
            htmlFor="onboarding-nick"
            className="text-xs font-bold uppercase tracking-wider text-zinc-500"
          >
            Twój nick
          </label>
          <input
            id="onboarding-nick"
            type="text"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            maxLength={24}
            autoFocus
            autoComplete="username"
            placeholder="np. MatmaMaster"
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-base font-bold text-white outline-none placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/25"
          />

          {error && (
            <p className="mt-2 text-sm font-semibold text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3.5 text-base font-black text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden />
            )}
            {saving ? "Zapisywanie…" : "Dołącz do rankingu"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
