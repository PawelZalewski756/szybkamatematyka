"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { TaskArena } from "@/components/trening/TaskArena";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { TheoryTableOfContents } from "@/components/trening/TheoryTableOfContents";
import { fetchMaterialByTopic } from "@/lib/supabase/materials";
import { extractMarkdownHeadings } from "@/lib/trening/theory-content";
import {
  parseYouTubeVideoId,
  youTubeEmbedUrl,
} from "@/lib/video/youtube";
import type { ExamType, Material } from "@/types/database";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type TabId = "teoria" | "arena";

type TopicPageClientProps = {
  examType: ExamType;
  category: string;
  topic: string;
  topicLabel: string;
  backHref: string;
  initialMaterial?: Material | null;
  initialMaterialError?: string | null;
};

function TabSwitcher({
  activeTab,
  onChange,
}: {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Sekcje tematu"
      className="mx-auto flex w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.06] p-1 shadow-[0_0_32px_rgba(0,0,0,0.25)] backdrop-blur-xl"
    >
      {(
        [
          { id: "teoria" as const, label: "Teoria" },
          { id: "arena" as const, label: "Zadania" },
        ] as const
      ).map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-bold transition-colors duration-200 ${
              isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="topic-tab-pill"
                className="absolute inset-0 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/25 via-orange-500/20 to-amber-500/25 shadow-[0_0_20px_rgba(232,112,42,0.2)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LessonVideoSection({ videoUrl }: { videoUrl: string }) {
  const youtubeId = parseYouTubeVideoId(videoUrl);

  return (
    <section className="mt-8 rounded-xl border border-white/15 bg-white/[0.04] p-4 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-orange-300/90">
        Wideo do lekcji
      </h3>
      {youtubeId ? (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
          <iframe
            src={youTubeEmbedUrl(youtubeId)}
            title="Wideo do lekcji"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/15 px-5 py-2.5 text-sm font-bold text-orange-400 transition hover:bg-orange-500/25"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Otwórz wideo w nowej karcie
        </a>
      )}
    </section>
  );
}

function TheoryTab({
  material,
  loading,
  loadError,
  onRetry,
  onGoToArena,
}: {
  material: Material | null;
  loading: boolean;
  loadError: string | null;
  onRetry: () => void;
  onGoToArena: () => void;
}) {
  const headings = useMemo(
    () => (material ? extractMarkdownHeadings(material.content) : []),
    [material],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-9 w-9 animate-spin text-orange-400" />
        <p className="mt-3 text-sm font-semibold text-zinc-400">
          Ładowanie materiału…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-red-300">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-100 transition hover:bg-red-500/25"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <BookOpen className="mx-auto h-10 w-10 text-zinc-500" aria-hidden />
        <p className="mt-4 text-lg font-bold text-zinc-200">
          Teoria w przygotowaniu
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Pracujemy nad lekcją do tego tematu. Możesz już ćwiczyć zadania w
          arenie — teoria pojawi się wkrótce.
        </p>
        <button
          type="button"
          onClick={onGoToArena}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/15 px-5 py-2.5 text-sm font-bold text-orange-400 transition hover:bg-orange-500/25"
        >
          Przejdź do zadań
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),14rem] lg:items-start lg:gap-8">
        <div className="min-w-0 rounded-xl bg-white/5 p-6 backdrop-blur-md">
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {material.title}
          </h2>
          {headings.length >= 2 && (
            <div className="mt-4 lg:hidden">
              <TheoryTableOfContents headings={headings} />
            </div>
          )}
          <div className="mt-4">
            <TheoryMarkdown content={material.content} />
          </div>
          {material.video_url && (
            <LessonVideoSection videoUrl={material.video_url} />
          )}
        </div>
        {headings.length >= 2 && (
          <div className="hidden lg:block">
            <TheoryTableOfContents headings={headings} />
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onGoToArena}
          className="inline-flex items-center gap-2 rounded-xl border border-orange-400/40 bg-orange-500/15 px-6 py-3 text-sm font-bold text-orange-100 shadow-[0_0_24px_rgba(217,70,239,0.15)] transition hover:bg-orange-500/25"
        >
          Przejdź do rozwiązywania
        </button>
      </div>
    </div>
  );
}

export function TopicPageClient({
  examType,
  category,
  topic,
  topicLabel,
  backHref,
  initialMaterial,
  initialMaterialError = null,
}: TopicPageClientProps) {
  const hasInitialMaterial = initialMaterial !== undefined;
  const [activeTab, setActiveTab] = useState<TabId>("teoria");
  const [material, setMaterial] = useState<Material | null>(
    initialMaterial ?? null,
  );
  const [materialLoading, setMaterialLoading] = useState(
    !hasInitialMaterial,
  );
  const [materialError, setMaterialError] = useState<string | null>(
    initialMaterialError ?? null,
  );

  const loadMaterial = useCallback(async () => {
    setMaterialLoading(true);
    setMaterialError(null);
    try {
      const row = await fetchMaterialByTopic(examType, category, topic);
      setMaterial(row);
    } catch {
      setMaterialError("Nie udało się załadować materiału.");
      setMaterial(null);
    } finally {
      setMaterialLoading(false);
    }
  }, [examType, category, topic]);

  useEffect(() => {
    if (hasInitialMaterial) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMaterial();
  }, [hasInitialMaterial, loadMaterial]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <GamingBackground />

      <div className="relative z-10 flex flex-1 flex-col py-6 sm:py-10">
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-400 transition hover:text-orange-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Trening
          </Link>
        </div>

        <p className="mb-4 text-center text-sm font-semibold text-orange-300/90">
          {topicLabel}
        </p>

        <div className="mb-6">
          <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "teoria" ? (
            <motion.div
              key="teoria"
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto w-full max-w-4xl flex-1 px-1"
            >
              <TheoryTab
                material={material}
                loading={materialLoading}
                loadError={materialError}
                onRetry={() => void loadMaterial()}
                onGoToArena={() => setActiveTab("arena")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="arena"
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TaskArena
                examType={examType}
                category={category}
                topic={topic}
                topicLabel={topicLabel}
                backHref={backHref}
                compactChrome
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
