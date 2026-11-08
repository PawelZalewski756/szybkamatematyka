import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_ALT = `${SITE_NAME} - matura i egzamin ósmoklasisty online`;
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
            "linear-gradient(135deg, #0a0f14 0%, #111820 55%, #0f172a 100%)",
          color: "#f1f5f9",
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
            color: "#5eead4",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 920,
          }}
        >
          Matematyka pod maturę i egzamin ósmoklasisty
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 30,
            color: "#94a3b8",
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          Arkusze CKE, baza zadań z rozwiązaniami i trening tematyczny - w jednej
          aplikacji.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            height: 8,
            width: 320,
            borderRadius: 999,
            background: "linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)",
          }}
        />
      </div>
    ),
    { ...OG_SIZE },
  );
}
