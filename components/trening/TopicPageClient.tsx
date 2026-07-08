"use client";

import { TaskArena } from "@/components/trening/TaskArena";
import { TheorySectionView } from "@/components/trening/TheorySectionView";
import { TheoryTableOfContents } from "@/components/trening/TheoryTableOfContents";
import { fetchMaterialByTopic } from "@/lib/supabase/materials";
import {
  parseTheorySections,
  sectionsToHeadings,
} from "@/lib/trening/theory-sections";
import {
  parseYouTubeVideoId,
  youTubeEmbedUrl,
} from "@/lib/video/youtube";
import type { ExamType, Material } from "@/types/database";
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
      className="flex w-full max-w-sm rounded-lg border border-surface-border bg-surface p-1"
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
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold transition ${
              isActive
                ? "bg-background text-brand"
                : "text-muted hover:text-foreground"
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
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
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
  const sections = useMemo(
    () => (material ? parseTheorySections(material.content) : []),
    [material],
  );
  const headings = useMemo(() => sectionsToHeadings(sections), [sections]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
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
          Możesz już ćwiczyć zadania — lekcja pojawi się wkrótce.
        </p>
        <button type="button" onClick={onGoToArena} className="btn-primary mt-6 px-5 py-2.5 text-sm">
          Przejdź do zadań
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),11rem] lg:items-start lg:gap-8">
        <article className="min-w-0 surface-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground">{material.title}</h2>
          {headings.length >= 2 && (
            <div className="mt-6 lg:hidden">
              <TheoryTableOfContents headings={headings} />
            </div>
          )}
          <div className="mt-6">
            <TheorySectionView content={material.content} />
          </div>
          {material.video_url && (
            <LessonVideoSection videoUrl={material.video_url} />
          )}
        </article>
        {headings.length >= 2 && (
          <div className="hidden lg:block">
            <TheoryTableOfContents headings={headings} />
          </div>
        )}
      </div>
      <div>
        <button type="button" onClick={onGoToArena} className="btn-primary px-6 py-3 text-sm">
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
    <div className="page-container flex min-h-0 flex-1 flex-col py-6 sm:py-10">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Trening
      </Link>

      <h1 className="mb-4 text-xl font-semibold text-foreground">{topicLabel}</h1>

      <div className="mb-6">
        <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "teoria" ? (
        <div role="tabpanel" className="mx-auto w-full max-w-3xl flex-1">
          <TheoryTab
            material={material}
            loading={materialLoading}
            loadError={materialError}
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
  );
}
