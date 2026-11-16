import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/school-inquiry/route";

function request(body: unknown): Request {
  return new Request("http://localhost/api/school-inquiry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID = {
  school: "Szkoła Podstawowa nr 1",
  name: "Anna Nauczycielka",
  email: "anna@example.com",
  message: "Potrzebujemy sprawdzianów dla pięciu klas.",
  consent: true,
  website: "",
};

describe("POST /api/school-inquiry", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("odrzuca brak zgody", async () => {
    const response = await POST(request({ ...VALID, consent: false }));
    expect(response.status).toBe(400);
  });

  it("odrzuca zbyt krótką wiadomość", async () => {
    const response = await POST(request({ ...VALID, message: "krótko" }));
    expect(response.status).toBe(400);
  });

  it("zwraca 503 bez klucza Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const response = await POST(request(VALID));
    expect(response.status).toBe(503);
  });

  it("wysyła zapytanie przez Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request(VALID));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
