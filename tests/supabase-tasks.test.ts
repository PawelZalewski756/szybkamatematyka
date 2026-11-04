import { describe, expect, it } from "vitest";
import { parseTaskOptions } from "@/lib/supabase/tasks";

describe("parseTaskOptions", () => {
  it("keeps options returned as a JSON array", () => {
    expect(parseTaskOptions(["A", "B"])).toEqual(["A", "B"]);
  });

  it("parses options stored as a JSON-encoded string", () => {
    expect(
      parseTaskOptions(JSON.stringify(["$\\log_2 2$", "$\\log_2 4$"])),
    ).toEqual(["$\\log_2 2$", "$\\log_2 4$"]);
  });

  it("ignores malformed or non-array option values", () => {
    expect(parseTaskOptions("not valid JSON")).toEqual([]);
    expect(parseTaskOptions(JSON.stringify({ A: "1" }))).toEqual([]);
  });
});
