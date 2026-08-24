"use client";

import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { LearningPathProvider } from "@/components/LearningPathProvider";
import { SchoolClassSync } from "@/components/SchoolClassSync";
import { StreakReminderHost } from "@/components/reminders/StreakReminderHost";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SolvedTasksProvider } from "@/components/SolvedTasksProvider";
import { ReviewProvider } from "@/components/powtorki/ReviewProvider";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // `reducedMotion="user"` sprawia, że wszystkie animacje framer-motion
    // automatycznie respektują systemowe ustawienie „prefers-reduced-motion”.
    <MotionConfig reducedMotion="user">
      <ServiceWorkerRegister />
      <LearningPathProvider>
        <SchoolClassSync />
        <SolvedTasksProvider>
          <ReviewProvider>
            <OnboardingGate>
              <StreakReminderHost />
              {children}
            </OnboardingGate>
          </ReviewProvider>
        </SolvedTasksProvider>
      </LearningPathProvider>
    </MotionConfig>
  );
}
