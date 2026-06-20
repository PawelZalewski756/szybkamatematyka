import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo/site";

/**
 * Wspólny renderer domyślnej grafiki Open Graph / Twitter.
 *
 * Świadomie korzystamy wyłącznie z systemowych fontów i kolorów (bez pobierania
 * zewnętrznych zasobów ani plików czcionek), dzięki czemu obraz generuje się
 * statycznie w trakcie buildu i nie zależy od sieci.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_ALT = `${SITE_NAME} — matematyka w tempie gry`;
export const OG_CONTENT_TYPE = "image/png";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #18181b 55%, #1e1b4b 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#e879f9",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Zhakuj matematykę. Rozwal egzamin.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 32,
            color: "#a1a1aa",
            maxWidth: 920,
          }}
        >
          Matura i egzamin ósmoklasisty (CKE) — minigry, baza zadań, arkusze i
          treningi w tempie gry.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            height: 8,
            width: 320,
            borderRadius: 999,
            background: "linear-gradient(90deg, #d946ef 0%, #22d3ee 100%)",
          }}
        />
      </div>
    ),
    { ...OG_SIZE },
  );
}
