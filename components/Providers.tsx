"use client";

import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { LearningPathProvider } from "@/components/LearningPathProvider";
import { SchoolClassSync } from "@/components/SchoolClassSync";
import { StreakReminderHost } from "@/components/reminders/StreakReminderHost";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SolvedTasksProvider } from "@/components/SolvedTasksProvider";
import { setRuntimePublicConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import { VisitCounter } from "@/components/analytics/VisitCounter";
import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import type { ReactNode } from "react";

function RuntimePublicConfig() {
  useEffect(() => {
    if (isSupabaseConfigured()) return;

    let cancelled = false;
    void fetch("/api/runtime-config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as {
          configured?: boolean;
          supabaseUrl?: string;
          supabaseAnonKey?: string;
          siteUrl?: string;
        };
      })
      .then((config) => {
        if (
          cancelled ||
          !config?.configured ||
          !config.supabaseUrl ||
          !config.supabaseAnonKey
        ) {
          return;
        }
        setRuntimePublicConfig({
          supabaseUrl: config.supabaseUrl,
          supabaseAnonKey: config.supabaseAnonKey,
          siteUrl: config.siteUrl,
        });
        window.dispatchEvent(new Event("supabase-config-ready"));
      })
      .catch((error: unknown) => {
        console.warn("[szybka-matma] runtime Supabase config:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    // `reducedMotion="user"` sprawia, że wszystkie animacje framer-motion
    // automatycznie respektują systemowe ustawienie „prefers-reduced-motion”.
    <MotionConfig reducedMotion="user">
      <RuntimePublicConfig />
      <ServiceWorkerRegister />
      <VisitCounter />
      <LearningPathProvider>
        <SchoolClassSync />
        <SolvedTasksProvider>
          <OnboardingGate>
            <StreakReminderHost />
            {children}
          </OnboardingGate>
        </SolvedTasksProvider>
      </LearningPathProvider>
    </MotionConfig>
  );
}
