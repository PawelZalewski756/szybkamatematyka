import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/seo/og";

export const alt = "Minigry matematyczne - Szybka Matematyka";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function MinigryOpengraphImage() {
  return renderOgImage({
    eyebrow: "MINIGRY",
    title: "Minigry matematyczne",
    subtitle:
      "34 gry w trzech trybach. 60 sekund rachunków i EXP.",
    footer: "szybkamatematyka.pl/minigry",
    primaryLabel: "Zagraj teraz",
    secondaryLabel: "Zobacz wszystkie gry",
  });
}
