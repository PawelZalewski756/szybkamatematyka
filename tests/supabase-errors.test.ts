import { describe, expect, it } from "vitest";
import { formatSupabaseErrorForUser } from "@/lib/supabase/errors";

describe("formatSupabaseErrorForUser", () => {
  it("nie pokazuje surowego TypeError: fetch failed", () => {
    expect(formatSupabaseErrorForUser("TypeError: fetch failed")).toBe(
      "Nie udało się połączyć z bazą. Spróbuj ponownie za chwilę.",
    );
  });
});
