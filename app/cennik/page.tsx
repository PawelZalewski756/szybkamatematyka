"use client";

import { PricingSection } from "@/components/home/PricingSection";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CennikPage() {
  return (
    <div className="relative flex flex-1 bg-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute right-0 bottom-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-500 hover:text-cyan-400"
          >
            ← Strona główna
          </Link>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Subskrypcja{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              Szybka Matma
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            Szczery cennik — bez ukrytych kosztów. Płatność obsługuje Stripe,
            subskrypcję anulujesz kiedy chcesz.
          </p>
        </motion.div>

        <div className="mt-12">
          <PricingSection />
        </div>
      </div>
    </div>
  );
}
