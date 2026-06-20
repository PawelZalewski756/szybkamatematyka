import { MinigameModePicker } from "@/components/minigry/MinigameModePicker";
import {
  getModeConfig,
  modeFromSlug,
} from "@/lib/minigry/game-modes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ mode: string }>;
};

export function generateStaticParams() {
  return [
    { mode: "time-attack" },
    { mode: "survival" },
    { mode: "marathon" },
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { mode: modeSlug } = await params;
  const mode = modeFromSlug(modeSlug);

  if (!mode) {
    return {
      title: "Tryb minigry",
      description: "Wybierz minigrę matematyczną w wybranym trybie rozgrywki.",
    };
  }

  const config = getModeConfig(mode);

  return {
    title: `Minigry — tryb ${config.title}`,
    description: `${config.description} Wybierz minigrę matematyczną i graj w trybie ${config.title}.`,
    alternates: { canonical: `/minigry/modes/${config.slug}` },
  };
}

export default async function MinigameModePage({ params }: PageProps) {
  const { mode: modeSlug } = await params;
  const mode = modeFromSlug(modeSlug);
  if (!mode) notFound();
  return <MinigameModePicker mode={mode} />;
}
