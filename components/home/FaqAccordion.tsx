"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Ile to kosztuje?",
    answer:
      "Start jest darmowy — możesz korzystać bez karty. Pro (29 zł/mies.) i Roczny (249 zł/rok) dają pełny dostęp do arkuszy i minigier; płatność przez Stripe, anulujesz kiedy chcesz.",
  },
  {
    question: "Co dostanę w subskrypcji Pro?",
    answer:
      "Wszystkie minigry z zapisem EXP, pełna baza arkuszy CKE z rozwiązaniami krok po kroku oraz filtry po roku, dziale i typie egzaminu (Matura / Egzamin 8-klasisty).",
  },
  {
    question: "Jak te minigry mają mi pomóc w egzaminie?",
    answer:
      "Większość punktów na egzaminie traci się przez głupie błędy i brak czasu. Nasze gry trenują refleks na najczęstszych pułapkach — bez zmyślonych statystyk, po prostu powtarzalny trening.",
  },
  {
    question: "Co jeśli nie ogarniam jakiegoś zadania z bazy?",
    answer:
      "Po to jest przycisk „Pokaż rozwiązanie”. Każde zadanie rozbijamy krok po kroku, bez akademickiego bełkotu.",
  },
  {
    question: "Czy mogę trenować Maturę i Egzamin 8-klasisty?",
    answer:
      "Tak. Wybierasz ścieżkę w pasku u góry — platforma dopasowuje minigry i filtry w bazie zadań.",
  },
] as const;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              id={`faq-trigger-${index}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-bold text-white sm:text-base">
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 text-zinc-400"
                aria-hidden
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-white/10 px-5 pb-4 pt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
