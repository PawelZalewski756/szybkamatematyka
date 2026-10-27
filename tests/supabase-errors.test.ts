import { describe, expect, it } from "vitest";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  formatSupabaseErrorForUser,
  isPostgrestNoRowsError,
  isPostgrestPermissionError,
} from "@/lib/supabase/errors";

function pgError(
  partial: Pick<PostgrestError, "message" | "code">,
): PostgrestError {
  return {
    name: "PostgrestError",
    details: "",
    hint: "",
    message: partial.message,
    code: partial.code,
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        details: this.details,
        hint: this.hint,
        code: this.code,
      };
    },
  };
}

describe("formatSupabaseErrorForUser", () => {
  it("nie pokazuje surowego TypeError: fetch failed", () => {
    expect(formatSupabaseErrorForUser("TypeError: fetch failed")).toBe(
      "Nie udało się połączyć z bazą. Spróbuj ponownie za chwilę.",
    );
  });

  it("kieruje do migracji grantów zapisu profilu", () => {
    expect(formatSupabaseErrorForUser("permission denied for column xp")).toMatch(
      /20261027140000_repair_profile_write_grants/,
    );
  });
});

describe("isPostgrestNoRowsError", () => {
  it("wykrywa PGRST116", () => {
    expect(
      isPostgrestNoRowsError(
        pgError({ message: "JSON object requested", code: "PGRST116" }),
      ),
    ).toBe(true);
    expect(
      isPostgrestNoRowsError(pgError({ message: "other", code: "42501" })),
    ).toBe(false);
  });
});

describe("isPostgrestPermissionError", () => {
  it("wykrywa 42501 i permission denied", () => {
    expect(
      isPostgrestPermissionError(
        pgError({ message: "permission denied for column nick", code: "42501" }),
      ),
    ).toBe(true);
    expect(
      isPostgrestPermissionError(
        pgError({ message: "Permission Denied for table", code: "PGRST301" }),
      ),
    ).toBe(true);
  });
});
