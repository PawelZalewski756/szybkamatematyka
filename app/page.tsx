"use client";

import { FaqAccordion } from "@/components/home/FaqAccordion";
import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomeExplorePanel } from "@/components/home/HomeExplorePanel";
import { HomeGamingFooter } from "@/components/home/HomeGamingFooter";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { PricingSection } from "@/components/home/PricingSection";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <HomeBackdrop />

      <section className="page-container flex flex-1 flex-col py-14 sm:py-20 lg:py-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,280px)] lg:items-start lg:gap-x-16 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-x-20">
          <div className="page-prose text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-teal-400/90"
            >
              Wersja beta
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
            >
              Matma pod maturę
              <br />
              i egzamin ósmoklasisty
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg lg:max-w-xl"
            >
              Arkusze CKE, zadania z wyjaśnieniami i trening po tematach — w jednym
              miejscu.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Link
                href="/arkusze"
                className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-950/30 transition hover:brightness-110"
              >
                Zacznij od arkuszy
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/trening"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-teal-500/30 hover:bg-teal-500/10"
              >
                Trening tematyczny
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-10 lg:justify-start"
            >
              <PlatformStatus variant="inline" />
            </motion.div>

            <div className="mt-12 lg:hidden">
              <HomeExplorePanel compact />
            </div>
          </div>

          <aside className="mt-12 hidden lg:block lg:mt-2">
            <HomeExplorePanel />
          </aside>
        </div>
      </section>

      <section className="page-container mt-20 border-t border-white/[0.06] pb-20 pt-12">
        <div className="max-w-2xl">
          <h2 className="text-base font-semibold text-slate-300">Dostęp</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Większość rzeczy działa na darmowym planie Start. Subskrypcja Pro to
            opcja, jeśli chcesz pełną bazę arkuszy — bez presji, bez ukrytych opłat.
          </p>
        </div>
        <div className="mt-6">
          <PricingSection compact />
        </div>

        <div className="mx-auto mt-16 max-w-3xl lg:max-w-4xl">
          <h2 className="text-center text-lg font-bold text-white lg:text-left lg:text-xl">
            Pytania i odpowiedzi
          </h2>
          <div className="mt-6">
            <FaqAccordion />
          </div>
        </div>

        <HomeGamingFooter />
      </section>
    </div>
  );
}
