import type { MetadataRoute } from "next";
import { getPrerenderTaskIds } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { listOfficialCkeSheets } from "@/lib/baza-zadan/exams/archive-catalog";
import { officialCkeSheetHref } from "@/lib/baza-zadan/exams/archive-sheet-meta";
import { getTreningTopicUrls } from "@/lib/seo/trening-urls";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Mapa serwisu.
 *
 * Zakres (świadomy wybór): główne trasy publiczne + statycznie prerenderowane
 * zadania (`st-*`, dodatkowe oraz archiwum egzaminacyjne) i finalne arkusze.
 * Pomijamy zadania PROCEDURALNE (`proc-*`, generowane on-demand) — byłoby to
 * 1000+ URL-i o niskiej wartości SEO — oraz trasy prywatne/uwierzytelniania
 * (`/admin`, `/login`, `/profil`), które i tak są zablokowane w `robots.ts`.
 */
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/minigry", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trening", changeFrequency: "weekly", priority: 0.9 },
  { path: "/baza-zadan", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trening/arkusze", changeFrequency: "weekly", priority: 0.85 },
  { path: "/wyzwania", changeFrequency: "daily", priority: 0.8 },
  { path: "/pojedynki", changeFrequency: "weekly", priority: 0.7 },
  { path: "/powtorki", changeFrequency: "weekly", priority: 0.7 },
  { path: "/rankingi", changeFrequency: "daily", priority: 0.6 },
  { path: "/osiagniecia", changeFrequency: "monthly", priority: 0.5 },
  { path: "/cennik", changeFrequency: "monthly", priority: 0.6 },
  { path: "/polityka-prywatnosci", changeFrequency: "yearly", priority: 0.3 },
  { path: "/regulamin", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const taskEntries: MetadataRoute.Sitemap = getPrerenderTaskIds().map(
    (id) => ({
      url: `${SITE_URL}/baza-zadan/${id}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    }),
  );

  const sheetEntries: MetadataRoute.Sitemap = EXAM_SHEETS.map((sheet) => ({
    url: `${SITE_URL}/baza-zadan/arkusz/${sheet.id}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const treningTopicEntries: MetadataRoute.Sitemap = getTreningTopicUrls().map(
    (entry) => ({
      url: `${SITE_URL}${entry.path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    }),
  );

  const ckeSheetEntries: MetadataRoute.Sitemap = listOfficialCkeSheets().map(
    (sheet) => ({
      url: `${SITE_URL}${officialCkeSheetHref(sheet.id)}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.55,
    }),
  );

  return [
    ...staticEntries,
    ...treningTopicEntries,
    ...taskEntries,
    ...sheetEntries,
    ...ckeSheetEntries,
  ];
}
