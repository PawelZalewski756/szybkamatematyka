"use client";

import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import {
  completeProfileOnboarding,
  createProfile,
  isNickTaken,
  NickTakenError,
  normalizeNick,
  updateProfileSchoolClass,
  type Profile,
} from "@/lib/supabase/profiles";
import { notifyProfileUpdated } from "@/lib/profile-sync";
import { AUTH_INPUT_CLASS } from "@/components/auth/AuthFormParts";
import {
  loadSchoolClass,
  saveSchoolClass,
  type SchoolClassPath,
} from "@/lib/learning-path";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Gamepad2, Loader2 } from "lucide-react";
import { useState } from "react";

type OnboardingModalProps = {
  user: User;
  onComplete: (profile: Profile) => void;
};

export function OnboardingModal({ user, onComplete }: OnboardingModalProps) {
  const [nick, setNick] = useState("");
  const [schoolClass, setSchoolClass] = useState<SchoolClassPath>(() =>
    loadSchoolClass(),
  );
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
        saved = await completeProfileOnboarding(user.id, next, schoolClass);
      } catch (primaryErr) {
        if (primaryErr instanceof NickTakenError) throw primaryErr;
        // Fallback: insert/update nick, potem osobno klasa (gdy school_class pada).
        saved = await createProfile(user.id, next);
        try {
          saved = await updateProfileSchoolClass(user.id, schoolClass);
        } catch {
          // Klasa lokalnie — nick w bazie jest ważniejszy niż school_class.
        }
      }

      if (normalizeNick(saved.nick) !== next) {
        setError("Nick nie został zapisany w bazie. Spróbuj ponownie.");
        return;
      }

      saveSchoolClass(schoolClass);
      notifyProfileUpdated(saved);
      onComplete(saved);
    } catch (err) {
      if (err instanceof NickTakenError) {
        setError("Ten nick jest już zajęty!");
        return;
      }
      const detail =
        err instanceof Error && /migracj|uprawnie/i.test(err.message)
          ? err.message
          : "Nie udało się zapisać profilu. Spróbuj ponownie.";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-accent/25 bg-surface p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-4 flex justify-center">
          <div className="icon-chip flex h-14 w-14 rounded-2xl">
            <Gamepad2 className="h-7 w-7" aria-hidden />
          </div>
        </div>

        <h2
          id="onboarding-title"
          className="text-center text-xl font-black text-foreground sm:text-2xl"
        >
          Witaj w grze!
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          Wybierz nick i klasę — dopasujemy zadania do Twojego poziomu.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6">
          <label htmlFor="onboarding-nick" className="text-overline">
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
            placeholder="np. KasiaM"
            className={`${AUTH_INPUT_CLASS} mt-2 w-full text-base font-bold`}
          />

          <p className="text-overline mt-4">Twoja klasa</p>
          <SchoolClassPicker
            id="onboarding-class"
            value={schoolClass}
            onChange={setSchoolClass}
            className="mt-2"
          />

          {error && (
            <p className="mt-2 text-sm font-semibold text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-chunky mt-4 flex w-full py-3.5 text-base disabled:opacity-60"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Zapisywanie…
              </span>
            ) : (
              "Dołącz do rankingu"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
