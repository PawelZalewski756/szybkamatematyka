"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMarks";
import { LOGO_PROPOSALS } from "@/lib/brand/logo-proposals";
import Link from "next/link";

function NavbarMock({ mark }: { mark: LogoMarkVariant }) {
  return (
    <div className="flex h-14 items-center gap-6 rounded-xl border border-white/[0.08] bg-[#0a0f14]/90 px-4">
      <BrandLogo asLink={false} mark={mark} />
      <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden />
      <span className="hidden text-xs text-slate-600 sm:block">Trening · Arkusze · …</span>
    </div>
  );
}

function FaviconMock({ mark }: { mark: LogoMarkVariant }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0f14] ring-1 ring-white/10">
          <LogoMark variant={mark} size={20} />
        </div>
        <span className="text-[10px] text-slate-600">32px</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a0f14] ring-1 ring-white/10">
          <LogoMark variant={mark} size={40} />
        </div>
        <span className="text-[10px] text-slate-600">64px</span>
      </div>
    </div>
  );
}

export function LogoPreviewContent() {
  return (
    <>
      <div className="mt-10 space-y-8">
        {LOGO_PROPOSALS.map((proposal, index) => (
          <article
            key={proposal.id}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-teal-500/80">
                  Propozycja {String.fromCharCode(65 + index)} · {proposal.id}
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">{proposal.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{proposal.tagline}</p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0a0f14] ring-1 ring-white/10">
                <LogoMark variant={proposal.id} size={48} />
              </div>
            </div>

            <ul className="mt-4 space-y-1.5">
              {proposal.pros.map((pro) => (
                <li
                  key={pro}
                  className="flex gap-2 text-sm text-slate-400 before:shrink-0 before:text-teal-600 before:content-['·']"
                >
                  {pro}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  W navbarze
                </p>
                <NavbarMock mark={proposal.id} />
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Jako ikona
                </p>
                <FaviconMock mark={proposal.id} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/[0.06] pt-6">
              <BrandLogo asLink={false} mark={proposal.id} />
              <BrandLogo asLink={false} mark={proposal.id} markSize={24} />
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-slate-600">
        Daj znać: np. „weź C” albo „monogram + inny wordmark” — dopasujemy favicon
        i resztę.
      </p>
    </>
  );
}

export function LogoPreviewHeader() {
  return (
    <>
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
        ← Strona główna
      </Link>

      <header className="mt-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/80">
          Brand · wewnętrzny podgląd
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Propozycje logo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Pięć wariantów znaku przy obecnym słowie{" "}
          <span className="text-slate-400">szybka·matematyka</span>. Wybierz
          literę lub nazwę — wdrożymy go w navbarze, faviconie i PWA.
        </p>
      </header>
    </>
  );
}
