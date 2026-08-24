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
  onSkip: () => void;
};

export function OnboardingModal({
  user,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
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
      } catch {
        try {
          saved = await createProfile(user.id, next);
          saved = await updateProfileSchoolClass(user.id, schoolClass);
        } catch {
          saved = await createProfile(user.id, next);
        }
      }

      saveSchoolClass(schoolClass);
      notifyProfileUpdated(saved);
      onComplete(saved);
    } catch (err) {
      if (err instanceof NickTakenError) {
        setError("Ten nick jest już zajęty!");
        return;
      }
      setError("Nie udało się zapisać profilu. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-[200] flex justify-center p-4 lg:bottom-4"
      role="dialog"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-accent/25 bg-surface p-5 shadow-2xl sm:p-6"
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
          Uzupełnij profil
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
              "Zapisz profil"
            )}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="mt-3 w-full py-2 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-50"
          >
            Później
          </button>
        </form>
      </motion.div>
    </div>
  );
}
