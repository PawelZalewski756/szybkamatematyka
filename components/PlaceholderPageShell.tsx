"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type PlaceholderPageShellProps = {
  title: string;
};

export function PlaceholderPageShell({ title }: PlaceholderPageShellProps) {
  return (
    <div className="relative flex flex-1 flex-col bg-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-500 transition-colors hover:text-cyan-400"
          >
            ← Strona główna
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-base text-zinc-400 sm:text-lg">
            Work in progress...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
