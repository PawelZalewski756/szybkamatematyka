"use client";

import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import {
  DEFAULT_SCHOOL_CLASS,
  saveSchoolClass,
  type SchoolClassPath,
} from "@/lib/learning-path";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type GuestClassModalProps = {
  onComplete: () => void;
  onSkip: () => void;
};

export function GuestClassModal({ onComplete, onSkip }: GuestClassModalProps) {
  const [schoolClass, setSchoolClass] =
    useState<SchoolClassPath>(DEFAULT_SCHOOL_CLASS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolClass(schoolClass);
    onComplete();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-[200] flex justify-center p-4 lg:bottom-4"
      role="dialog"
      aria-labelledby="guest-class-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-accent/25 bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex justify-center">
          <div className="icon-chip flex h-14 w-14 rounded-2xl">
            <GraduationCap className="h-7 w-7" aria-hidden />
          </div>
        </div>

        <h2
          id="guest-class-title"
          className="text-center text-xl font-black text-foreground sm:text-2xl"
        >
          W jakiej jesteś klasie?
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          Dopasujemy zadania i minigry do Twojego poziomu. Możesz to później
          zmienić w menu „Więcej”.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <p className="text-overline">Twoja klasa</p>
          <SchoolClassPicker
            id="guest-class"
            value={schoolClass}
            onChange={setSchoolClass}
            className="mt-2"
          />

          <button
            type="submit"
            className="btn-chunky mt-4 w-full py-3.5 text-base"
          >
            Zaczynamy
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="mt-3 w-full py-2 text-sm font-semibold text-muted hover:text-foreground"
          >
            Pomiń na razie
          </button>
        </form>
      </motion.div>
    </div>
  );
}
