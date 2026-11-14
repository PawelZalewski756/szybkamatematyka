"use client";

import { TaskArena } from "@/components/trening/TaskArena";
import { TheorySectionView } from "@/components/trening/TheorySectionView";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchMaterialByTopic } from "@/lib/supabase/materials";
import { findCkeCategoryLabel } from "@/lib/trening/cke-curriculum";
import { formatTreningLabel } from "@/lib/trening/dynamic-tree";
import { getTopicSummary, type TopicSummary } from "@/lib/trening/summaries";
import { saveRecentTrainingTopic } from "@/lib/trening/recent-topic";
import {
  parseYouTubeVideoId,
  youTubeEmbedUrl,
} from "@/lib/video/youtube";
import type { ExamType, Material } from "@/types/database";
import { ArrowLeft, BookOpen, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type TabId = "teoria" | "arena";

const EXAM_LABELS: Record<ExamType, string> = {
  matura_podstawowa: "Matura podstawowa",
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": "Egzamin ósmoklasisty",
};

type TopicPageClientProps = {
  examType: ExamType;
  category: string;
  topic: string;
  topicLabel: string;
  backHref: string;
  initialMaterial?: Material | null;
  initialMaterialError?: string | null;
};

type LoadMaterialOptions = {
  background?: boolean;
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
      className="inline-flex rounded-lg border border-surface-border bg-surface p-1"
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
            className={`rounded-md px-4 py-2 text-sm font-bold transition ${
              isActive
                ? "bg-accent text-on-accent shadow-sm"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function LessonVideoSection({ videoUrl }: { videoUrl: string }) {
  const youtubeId = parseYouTubeVideoId(videoUrl);

  return (
    <section className="mt-8 border-t border-surface-border pt-8">
      <h3 className="text-sm font-medium text-muted">Wideo do lekcji</h3>
      {youtubeId ? (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-surface-border bg-black">
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
          className="mt-4 inline-flex items-center gap-2 text-sm link-plain"
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
  summary,
  onRetry,
  onGoToArena,
}: {
  material: Material | null;
  loading: boolean;
  loadError: string | null;
  summary: TopicSummary | null;
  onRetry: () => void;
  onGoToArena: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
        <p className="mt-3 text-sm text-muted">Ładowanie materiału…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="surface-card px-4 py-6 text-center">
        <p className="text-sm text-danger">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-hover"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="surface-card p-8 text-center">
        <BookOpen className="mx-auto h-9 w-9 text-muted" aria-hidden />
        <p className="mt-4 text-lg font-semibold text-foreground">
          Teoria w przygotowaniu
        </p>
        <p className="mt-2 text-sm text-muted">
          Możesz już ćwiczyć zadania - lekcja pojawi się wkrótce.
        </p>
        <button type="button" onClick={onGoToArena} className="btn-primary mt-6 px-5 py-2.5 text-sm">
          Przejdź do zadań
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <article className="min-w-0 surface-card p-6 sm:p-8">
        <TheorySectionView content={material.content} summary={summary} />

        {material.video_url && (
          <LessonVideoSection videoUrl={material.video_url} />
        )}
      </article>

      <div>
        <button
          type="button"
          onClick={onGoToArena}
          className="btn-chunky px-5 py-2.5 text-sm"
        >
          Przejdź do zadań
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
  const summary = useMemo(
    () => getTopicSummary(examType, category, topic),
    [examType, category, topic],
  );
  const categoryLabel =
    findCkeCategoryLabel(examType, category) ?? formatTreningLabel(category);
  const examLabel = EXAM_LABELS[examType];

  const loadMaterial = useCallback(
    async ({ background = false }: LoadMaterialOptions = {}) => {
      if (!background) {
        setMaterialLoading(true);
        setMaterialError(null);
      }

      try {
        const row = await fetchMaterialByTopic(examType, category, topic);
        if (row) {
          setMaterial(row);
          return;
        }

        if (background) return;

        const params = new URLSearchParams({
          examType,
          category,
          topic,
        });
        const res = await fetch(`/api/trening/material?${params}`);
        if (res.ok) {
          const body = (await res.json()) as { material: Material | null };
          setMaterial(body.material);
          return;
        }

        setMaterial(null);
      } catch (error) {
        if (background) {
          console.warn(
            "[trening/topic] background material refresh failed:",
            error,
          );
          return;
        }
        setMaterialError("Nie udało się załadować materiału.");
        setMaterial(null);
      } finally {
        if (!background) setMaterialLoading(false);
      }
    },
    [examType, category, topic],
  );

  useEffect(() => {
    const examKey =
      examType === "8_klasa"
        ? ("8_klasa" as const)
        : ("matura_podstawowa" as const);
    const recentTopic = { examKey, category, topic };

    saveRecentTrainingTopic(recentTopic);

    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    try {
      const supabase = getSupabase();
      void supabase.auth.getSession().then(({ data }) => {
        const userId = data.session?.user?.id;
        if (!cancelled && userId) {
          saveRecentTrainingTopic(recentTopic, userId);
        }
      });
    } catch {
      // Runtime config may still be loading; the guest snapshot is enough.
    }

    return () => {
      cancelled = true;
    };
  }, [category, examType, topic]);

  useEffect(() => {
    if (!hasInitialMaterial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadMaterial();
      return;
    }

    if (initialMaterial?.id.startsWith("seed:") && isSupabaseConfigured()) {
      void loadMaterial({ background: true });
    }
  }, [hasInitialMaterial, initialMaterial?.id, loadMaterial]);

  return (
    <div className="page-container flex min-h-0 flex-1 flex-col py-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <nav
            aria-label="Ścieżka nawigacji"
            className="flex flex-wrap items-center gap-2 text-xs text-muted"
          >
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Trening
            </Link>
            <span aria-hidden className="text-surface-border">
              /
            </span>
            <span className="font-semibold text-foreground/80">
              {categoryLabel}
            </span>
          </nav>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-overline text-accent">{examLabel}</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {topicLabel}
              </h1>
            </div>
            <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </header>

        {activeTab === "teoria" ? (
          <div role="tabpanel" className="w-full flex-1">
            <TheoryTab
              material={material}
              loading={materialLoading}
              loadError={materialError}
              summary={summary}
              onRetry={() => void loadMaterial()}
              onGoToArena={() => setActiveTab("arena")}
            />
          </div>
        ) : (
          <div role="tabpanel" className="flex min-h-0 flex-1 flex-col">
            <TaskArena
              examType={examType}
              category={category}
              topic={topic}
              topicLabel={topicLabel}
              backHref={backHref}
              compactChrome
            />
          </div>
        )}
      </div>
    </div>
  );
}
