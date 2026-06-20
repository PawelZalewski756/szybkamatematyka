"use client";

import { FaqAccordion } from "@/components/home/FaqAccordion";
import { HomeGamingFooter } from "@/components/home/HomeGamingFooter";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { PricingSection } from "@/components/home/PricingSection";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Shield,
  Smartphone,
  Star,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const featureCards = [
  {
    title: "Zdobywaj EXP",
    description: "Każda sesja podbija progres i buduje Twój skill level.",
    icon: Star,
  },
  {
    title: "Bez lania wody",
    description: "Konkretne schematy i pułapki egzaminacyjne bez przynudzania.",
    icon: Shield,
  },
  {
    title: "Wszędzie z Tobą",
    description: "Działa idealnie na telefonie, więc trenujesz gdzie chcesz.",
    icon: Smartphone,
  },
] as const;

const successSteps = [
  {
    step: "Krok 1",
    title: "Wybierz Cel",
    description:
      "Wybierasz Maturę lub Egzamin 8-klasisty i od razu wiesz, pod co grasz.",
    icon: Target,
    glow: "shadow-[0_0_40px_rgba(217,70,239,0.35)]",
    ring: "ring-fuchsia-400/50",
    iconBg: "bg-fuchsia-500/20 text-fuchsia-200",
  },
  {
    step: "Krok 2",
    title: "Trenuj Refleks",
    description:
      "Klikasz minigry, wyłapujesz pułapki CKE i ładujesz EXP w krótkich rundach.",
    icon: Zap,
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.35)]",
    ring: "ring-cyan-400/50",
    iconBg: "bg-cyan-500/20 text-cyan-200",
  },
  {
    step: "Krok 3",
    title: "Analizuj Arkusze",
    description:
      "Przeglądasz oryginalne zadania z pełnymi rozwiązaniami krok po kroku.",
    icon: Award,
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.35)]",
    ring: "ring-emerald-400/50",
    iconBg: "bg-emerald-500/20 text-emerald-200",
  },
] as const;

const viewport = { once: true, margin: "-80px" as const };

function ScrollSection({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col bg-[#0a0a0a]">
      <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 sm:px-6">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full bg-transparent text-center"
        >
          <h1 className="mx-auto w-full max-w-[1920px] text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl">
            Zhakuj Matematykę.{" "}
            <span className="animate-pulse bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              Wbijaj Levele.
            </span>{" "}
            Rozwal Egzamin.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-zinc-300 sm:text-lg md:text-xl">
            Platforma w wersji beta — matematyka w tempie gry, bez ściemniania
            liczbami.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="mt-8 w-full max-w-3xl"
        >
          <PlatformStatus />
        </motion.div>

        {/* CTA cards */}
        <section className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:mt-12 lg:mt-16 xl:grid-cols-4">
          <Link href="/minigry" className="group block">
            <motion.article
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-fuchsia-400/70 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-2xl border border-fuchsia-300/40 bg-fuchsia-400/15 p-3 text-fuchsia-200">
                  <Zap size={28} />
                </div>
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  Szybka Gra
                </h2>
                <p className="mt-3 text-zinc-200/90">
                  Trening refleksu i decyzyjności w ultra krótkich rundach.
                  Wpadasz na chwilę, wychodzisz mocniejszy.
                </p>
              </div>
            </motion.article>
          </Link>

          <Link href="/arkusze" className="group block">
            <motion.article
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-emerald-300/70 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-2xl border border-emerald-300/40 bg-emerald-400/15 p-3 text-emerald-200">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  Arkusze CKE
                </h2>
                <p className="mt-3 text-zinc-200/90">
                  Oficjalne sesje maturalne i E8 — po latach, z linkiem do
                  rozwiązań.
                </p>
              </div>
            </motion.article>
          </Link>

          <Link href="/trening" className="group block">
            <motion.article
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-violet-300/70 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-2xl border border-violet-300/40 bg-violet-400/15 p-3 text-violet-200">
                  <Target size={28} />
                </div>
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  Arena Treningu
                </h2>
                <p className="mt-3 text-zinc-200/90">
                  Tysiące zadań po tematach, EXP i ścieżka matura / ósemka.
                </p>
              </div>
            </motion.article>
          </Link>

          <Link href="/baza-zadan" className="group block">
            <motion.article
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-cyan-300/70 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/40 bg-cyan-400/15 p-3 text-cyan-200">
                  <Award size={28} />
                </div>
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  Pełna Baza
                </h2>
                <p className="mt-3 text-zinc-200/90">
                  Katalog z filtrami — działy, arkusze treningowe i import CKE.
                </p>
              </div>
            </motion.article>
          </Link>
        </section>

        {/* Features */}
        <ScrollSection className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <div className="mb-3 inline-flex rounded-xl border border-white/15 bg-white/5 p-2 text-zinc-100">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-300">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </ScrollSection>

        {/* Droga do sukcesu */}
        <ScrollSection className="mt-20 w-full lg:mt-28">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              3 Kroki Do Rozwalenia Systemu
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Droga do sukcesu bez chaosu — od wyboru celu po pełną analizę
              arkuszy.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 xl:gap-8">
            {successSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ring-1 ${item.ring} ${item.glow}`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {item.step}
                  </p>
                  <div
                    className={`mt-4 inline-flex w-fit rounded-2xl p-3 ${item.iconBg}`}
                  >
                    <Icon size={26} />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-300">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </ScrollSection>

        {/* Subskrypcja */}
        <ScrollSection className="mt-20 w-full lg:mt-28" delay={0.05}>
          <div className="text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Wybierz swój plan
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Subskrypcja zamiast jednorazowych opłat — pełny dostęp, kiedy
              potrzebujesz. Ceny poniżej są docelowe; płatności włączymy wkrótce.
            </p>
          </div>
          <div className="mt-10">
            <PricingSection />
          </div>
        </ScrollSection>

        {/* FAQ */}
        <ScrollSection className="mt-20 w-full lg:mt-28" delay={0.05}>
          <h2 className="text-center text-2xl font-black text-white sm:text-3xl">
            Szybkie pytania, proste odpowiedzi
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-400">
            Zero korpo-bełkotu — odpowiadamy jak kumpel z ławki.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <FaqAccordion />
          </div>
        </ScrollSection>

        <HomeGamingFooter />
      </div>
    </div>
  );
}
