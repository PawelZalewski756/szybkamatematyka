"use client";

import {
  BUG_REPORT_LIMITS,
  parseBugReportFields,
} from "@/lib/bug-report/report";
import {
  compressReportImage,
  validateReportImage,
} from "@/lib/image/compress-report-image";
import { CheckCircle2, Loader2, Send, X } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";

type BugReportStatus = "idle" | "sending" | "success" | "error";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-wide text-muted";
const FIELD_CLASS = "input-field mt-1.5 w-full px-3.5 py-3 text-sm";

type BugReportFormProps = {
  initialTitle?: string;
  initialDescription?: string;
};

export function BugReportForm({
  initialTitle = "",
  initialDescription = "",
}: BugReportFormProps = {}) {
  const baseId = useId();
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
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
      setMessage("Odezwiemy się na podany adres e-mail.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-8 text-center sm:p-10">
        <CheckCircle2
          className="mx-auto h-10 w-10 text-accent"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Dziękujemy za zgłoszenie
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="btn-ghost mt-6 px-4 py-2 text-sm font-semibold"
        >
          Wyślij kolejne zgłoszenie
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${baseId}-website`}>Nie wypełniaj tego pola</label>
        <input
          id={`${baseId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${baseId}-email`} className={LABEL_CLASS}>
            Twój e-mail
          </label>
          <input
            id={`${baseId}-email`}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="twoj@email.pl"
            maxLength={BUG_REPORT_LIMITS.emailMax}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-title`} className={LABEL_CLASS}>
            Tytuł
          </label>
          <input
            id={`${baseId}-title`}
            type="text"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="np. Błąd w zadaniu 12"
            maxLength={BUG_REPORT_LIMITS.titleMax}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={`${baseId}-description`} className={LABEL_CLASS}>
          Opis
        </label>
        <textarea
          id={`${baseId}-description`}
          name="description"
          required
          rows={7}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder="Co się stało? Podaj adres strony i krok po kroku, jak dojść do błędu."
          maxLength={BUG_REPORT_LIMITS.descriptionMax}
          className={`${FIELD_CLASS} resize-y leading-relaxed`}
        />
      </div>

      <div className="mt-5">
        <label htmlFor={`${baseId}-attachment`} className={LABEL_CLASS}>
          Zrzut ekranu (opcjonalnie)
        </label>
        <input
          ref={fileInputRef}
          id={`${baseId}-attachment`}
          type="file"
          name="attachment"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) =>
            handleFileChange(event.currentTarget.files?.[0] ?? null)
          }
          className={`${FIELD_CLASS} py-2.5 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground`}
        />
        <p className="mt-1.5 text-xs text-muted">
          PNG, JPG, WEBP lub GIF. Zdjęcie jest zmniejszane przed wysłaniem,
          maks. 3 MB.
        </p>
        {attachment ? (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground">
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
          className="mt-5 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-xs leading-relaxed text-muted">
          Adres e-mail wykorzystamy tylko do odpowiedzi na zgłoszenie.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="btn-chunky shrink-0 px-5 py-3 text-sm disabled:opacity-60"
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
  );
}
