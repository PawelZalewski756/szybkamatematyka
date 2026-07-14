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
};

export function GuestClassModal({ onComplete }: GuestClassModalProps) {
  const [schoolClass, setSchoolClass] =
    useState<SchoolClassPath>(DEFAULT_SCHOOL_CLASS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolClass(schoolClass);
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-class-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-accent/25 bg-surface p-6 shadow-2xl sm:p-8"
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
        </form>
      </motion.div>
    </div>
  );
}
