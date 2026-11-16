"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "success" | "error";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-surface-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20";

export function SchoolInquiryForm() {
  const [school, setSchool] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/school-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, name, email, message, consent, website }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setError(data.error ?? "Nie udało się wysłać zapytania.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Błąd sieci. Spróbuj ponownie.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-5" role="status">
        <p className="flex items-center gap-2 font-bold text-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          Dziękujemy — zapytanie zostało wysłane.
        </p>
        <p className="mt-2 text-sm text-muted">
          Odpowiemy na podany adres e-mail. Jeśli sprawa jest pilna, napisz
          bezpośrednio na kontakt@szybkamatematyka.pl.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-surface-border bg-surface p-5">
      <h2 className="text-lg font-extrabold text-foreground">Zapytaj o pakiet szkolny</h2>
      <p className="mt-1 text-sm text-muted">
        Napisz, czego potrzebuje szkoła — odpowiemy z propozycją.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-foreground">
          Szkoła
          <input
            className={INPUT_CLASS}
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            required
            maxLength={160}
            autoComplete="organization"
          />
        </label>
        <label className="text-sm font-semibold text-foreground">
          Imię i nazwisko
          <input
            className={INPUT_CLASS}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={80}
            autoComplete="name"
          />
        </label>
      </div>

      <label className="mt-3 block text-sm font-semibold text-foreground">
        E-mail
        <input
          type="email"
          className={INPUT_CLASS}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={160}
          autoComplete="email"
        />
      </label>

      <label className="mt-3 block text-sm font-semibold text-foreground">
        Czego potrzebujecie?
        <textarea
          className={`${INPUT_CLASS} min-h-28 resize-y`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          maxLength={2000}
          placeholder="np. sprawdziany dla 5 klas, diagnostyka na początku roku, faktura VAT…"
        />
      </label>

      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          required
        />
        <span>
          Zgadzam się na kontakt w sprawie pakietu szkolnego i przetwarzanie
          podanych danych w tym celu.
        </span>
      </label>

      {/* Honeypot */}
      <div className="sr-only" aria-hidden>
        <label>
          Strona
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-chunky mt-4 inline-flex items-center gap-2 px-5 py-3 text-sm disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Wysyłanie…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden />
            Wyślij zapytanie
          </>
        )}
      </button>
    </form>
  );
}
