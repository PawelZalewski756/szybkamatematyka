import { ConfiguredMinigame } from "@/components/minigry/ConfiguredMinigame";
import { parseMinigameMode } from "@/lib/minigry/game-modes";
import {
  getMinigameBySlug,
  MINIGAME_SLUGS,
} from "@/lib/minigry/minigame-registry";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export function generateStaticParams() {
  return MINIGAME_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getMinigameBySlug(slug);

  if (!game) {
    return {
      title: "Minigra matematyczna",
      description: "Trening matematyczny w formie szybkiej minigry.",
    };
  }

  return {
    title: `${game.title} — minigra matematyczna`,
    description: `${game.description} Graj online, zdobywaj EXP i trenuj matematykę w tempie gry.`,
    alternates: { canonical: `/minigry/${game.slug}` },
  };
}

export default async function MinigameBySlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { mode: modeParam } = await searchParams;
  const mode = parseMinigameMode(modeParam);
  return <ConfiguredMinigame slug={slug} mode={mode} />;
}
