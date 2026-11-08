const SQL_PATH = "supabase/migrations/init_baza_zadan.sql";

export function DatabaseSetupCard() {
  return (
    <div className="rounded-3xl border border-accent/30 bg-accent/10 px-6 py-8 sm:px-8">
      <h2 className="text-lg font-black text-accent">
        Baza Supabase wymaga jednorazowej konfiguracji
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Tabele <code className="text-accent">arkusze</code> i{" "}
        <code className="text-accent">zadania</code> nie istnieją w Twoim
        projekcie. To nie błąd strony - migracja SQL nie została jeszcze
        uruchomiona.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
        <li>
          Otwórz{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline"
          >
            panel Supabase
          </a>{" "}
          → swój projekt → <strong>SQL Editor</strong>.
        </li>
        <li>
          Skopiuj całą zawartość pliku{" "}
          <code className="text-accent">{SQL_PATH}</code> z repozytorium.
        </li>
        <li>
          Wklej do edytora i kliknij <strong>Run</strong>.
        </li>
        <li>
          Odśwież tę stronę - zadania możesz dodać skryptem{" "}
          <code className="text-accent">npm run seed:trening-tasks</code> lub
          bezpośrednio w Supabase.
        </li>
      </ol>
      <p className="mt-4 text-xs text-muted">
        Upewnij się też, że w <code>.env.local</code> masz poprawne{" "}
        <code>NEXT_PUBLIC_SUPABASE_URL</code> i{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> z tego samego projektu.
      </p>
    </div>
  );
}
