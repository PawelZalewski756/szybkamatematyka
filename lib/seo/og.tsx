import { ImageResponse } from "next/og";

import { BRAND_DOMAIN } from "@/lib/brand/constants";
import { SITE_NAME } from "@/lib/seo/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_ALT = `${SITE_NAME} - matura i egzamin ósmoklasisty online`;
export const OG_CONTENT_TYPE = "image/png";

type OgImageOptions = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  footer?: string;
};

/**
 * Wspólny obrazek do podglądu linków (Open Graph / Twitter).
 *
 * Kolory są celowo takie jak na stronie: kremowe tło, ciemny tekst i bursztynowy
 * akcent. Dzięki temu podgląd w Discordzie/WhatsApp/Slacku nie wygląda jak
 * osobna, ciemna aplikacja.
 */
export function renderOgImage({
  eyebrow = "MATURA · EGZAMIN ÓSMOKLASISTY",
  title = "Matematyka pod maturę i egzamin ósmoklasisty",
  subtitle = "Teoria, zadania, arkusze CKE, powtórki i gry — w jednym miejscu.",
  footer = BRAND_DOMAIN,
}: OgImageOptions = {}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          padding: "64px 72px",
          background: "#faf7f0",
          color: "#1c1812",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "#fdf0d3",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -190,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(244, 183, 64, 0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 380,
            height: 380,
            background:
              "linear-gradient(135deg, rgba(244, 183, 64, 0) 0%, rgba(244, 183, 64, 0.14) 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 54,
              height: 54,
              marginRight: 16,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              background: "#a15d00",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 26,
                height: 5,
                marginBottom: 8,
                borderRadius: 2,
                background: "#ffffff",
              }}
            />
            <div
              style={{
                display: "flex",
                width: 26,
                height: 5,
                borderRadius: 2,
                background: "#ffffff",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#a15d00",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            maxWidth: 960,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 900,
            fontSize: 28,
            lineHeight: 1.35,
            color: "#5a5245",
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 180,
              height: 8,
              marginRight: 20,
              borderRadius: 999,
              background: "#a15d00",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 600,
              color: "#5a5245",
            }}
          >
            {footer}
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              fontSize: 18,
              fontWeight: 700,
              color: "#a15d00",
            }}
          >
            Bez karty na start
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
