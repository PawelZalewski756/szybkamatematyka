"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import Link from "next/link";
import { motion } from "framer-motion";

type PlaceholderPageShellProps = {
  title: string;
};

export function PlaceholderPageShell({ title }: PlaceholderPageShellProps) {
  return (
    <div className="relative flex flex-1 flex-col bg-background">
      <GamingBackground />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <Link
            href="/"
            className="text-sm font-semibold text-muted transition-colors hover:text-accent"
          >
            ← Strona główna
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-base text-muted sm:text-lg">
            Work in progress...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
