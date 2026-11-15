"use client";

import { BUG_REPORT_LIMITS, parseBugReportFields } from "@/lib/bug-report/report";
import {
  compressReportImage,
  validateReportImage,
} from "@/lib/image/compress-report-image";
import { Bug, CheckCircle2, Loader2, Send, X } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";

type BugReportStatus = "idle" | "sending" | "success" | "error";

type BugReportSectionProps = {
  className?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BugReportSection({ className = "" }: BugReportSectionProps) {
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const panelId = `${baseId}-panel`;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [status, setStatus] = useState<BugReportStatus>("idle");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sending = status === "sending";

  const resetForm = () => {
    setEmail("");
    setTitle("");
    setDescription("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (file: File | null) => {
    setMessage("");
    setStatus("idle");

    if (!file) {
      setAttachment(null);
      return;
    }

    const validationError = validateReportImage(file);
    if (validationError) {
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus("error");
      setMessage(validationError);
      return;
    }

    setAttachment(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    const parsed = parseBugReportFields({ email, title, description });
    if (!parsed.ok) {
      setStatus("error");
      setMessage(parsed.error);
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const file = attachment ? await compressReportImage(attachment) : null;

      const form = new FormData();
      form.set("email", parsed.fields.email);
      form.set("title", parsed.fields.title);
      form.set("description", parsed.fields.description);
      form.set("pageUrl", window.location.href);
      form.set("userAgent", navigator.userAgent);
      form.set("website", "");
      if (file) form.set("attachment", file);

      const response = await fetch("/api/bug-report", {
        method: "POST",
        body: form,
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !data?.ok) {
        setStatus("error");
        setMessage(
          data?.error ??
            "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.",
        );
        return;
      }

      resetForm();
      setStatus("success");
      setMessage(
        "Dziękujemy! Zgłoszenie zostało wysłane - odezwiemy się na podany e-mail.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.",
      );
    }
  };

  return (
    <section
      id="zglos-blad"
      aria-labelledby={headingId}
      className={`mx-auto w-full max-w-3xl ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-bold text-foreground">
            Znalazłeś błąd?
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Zgłoś go nam - nie musisz mieć konta. Odpowiemy na podany e-mail.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
        >
          <Bug className="h-4 w-4" aria-hidden="true" />
          {open ? "Zamknij formularz" : "Zgłoś błąd"}
        </button>
      </div>

      {open ? (
        <form
          id={panelId}
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
          className="mt-4 rounded-xl border border-surface-border bg-surface p-4 sm:p-5"
        >
          <div aria-hidden="true" className="sr-only">
            <label htmlFor={`${panelId}-website`}>
              Nie wypełniaj tego pola
            </label>
            <input
              id={`${panelId}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                Twój e-mail
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                placeholder="twoj@email.pl"
                maxLength={BUG_REPORT_LIMITS.emailMax}
                className="input-field w-full px-3 py-2.5 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                Tytuł
              </span>
              <input
                type="text"
                name="title"
                required
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                placeholder="np. Błąd w zadaniu 12"
                maxLength={BUG_REPORT_LIMITS.titleMax}
                className="input-field w-full px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">
              Opis
            </span>
            <textarea
              name="description"
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              placeholder="Co się stało? Podaj adres strony i krok po kroku, jak dojść do błędu."
              maxLength={BUG_REPORT_LIMITS.descriptionMax}
              className="input-field w-full resize-y px-3 py-2.5 text-sm"
            />
          </label>

          <div className="mt-3 flex flex-col gap-1.5">
            <label
              htmlFor={`${panelId}-attachment`}
              className="text-xs font-bold uppercase tracking-wide text-muted"
            >
              Załącznik (opcjonalnie)
            </label>
            <input
              ref={fileInputRef}
              id={`${panelId}-attachment`}
              type="file"
              name="attachment"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) =>
                handleFileChange(event.currentTarget.files?.[0] ?? null)
              }
              className="input-field w-full px-3 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
            />
            <p className="text-xs text-muted">
              Zrzut ekranu (PNG, JPG, WEBP lub GIF). Zdjęcie jest zmniejszane
              przed wysłaniem, maks. 3 MB.
            </p>
            {attachment ? (
              <p className="flex items-center gap-2 text-xs text-foreground">
                <span className="font-semibold">{attachment.name}</span>
                <span className="text-muted">
                  ({formatFileSize(attachment.size)})
                </span>
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  className="inline-flex items-center gap-1 font-semibold text-muted hover:text-foreground"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Usuń
                </button>
              </p>
            ) : null}
          </div>

          {status === "error" && message ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              <span>{message}</span>
            </p>
          ) : null}

          <div role="status" aria-live="polite">
            {status !== "error" && message ? (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-foreground">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{message}</span>
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">
              Twoje dane wykorzystamy tylko do odpowiedzi na zgłoszenie.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="btn-chunky px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {sending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Wysyłanie…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Wyślij zgłoszenie
                </span>
              )}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
