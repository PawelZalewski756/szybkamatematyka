-- Klasa ucznia (np. klasa-8, liceum-2) - wybór przy onboardingu, zamiast suwaka w navbarze.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_class text;

COMMENT ON COLUMN public.profiles.school_class IS
  'Identyfikator klasy: klasa-1..8, liceum-1..4, technikum-1..5, zawodowa-1..5';
