import { expect, test } from "@playwright/test";

test.describe("Program poleceń", () => {
  test("link ?ref otwiera rejestrację i zapisuje kod", async ({ page }) => {
    await page.goto("/login?ref=ABC12345");

    await expect(
      page.getByRole("heading", { level: 1, name: /Dołącz do/ }),
    ).toBeVisible();
    await expect(
      page.getByText("Masz zaproszenie od znajomego.", { exact: false }),
    ).toBeVisible();

    const stored = await page.evaluate(() =>
      window.localStorage.getItem("sm-referral"),
    );
    expect(stored).toContain("abc12345");
  });

  test("rejestracja przekazuje kod polecający do API", async ({ page }) => {
    await page.route("**/rest/v1/profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    let signupBody: Record<string, unknown> | undefined;
    await page.route("**/api/signup", async (route) => {
      signupBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          userId: "11111111-1111-1111-1111-111111111111",
          needsConfirmation: true,
        }),
      });
    });

    await page.goto("/login?ref=abc12345");
    await page.getByPlaceholder("np. KasiaM").fill("TesterPolecen");
    await page.getByPlaceholder("twoj@email.pl").fill("tester@example.org");
    await page.getByPlaceholder("minimum 6 znaków").fill("tajnehaslo123");
    await page.getByPlaceholder("wpisz hasło jeszcze raz").fill("tajnehaslo123");
    await page.locator('input[name="termsAccepted"]').check();
    await page.locator('input[name="ageConfirmed"]').check();
    await page.getByRole("button", { name: "Utwórz konto" }).click();

    await expect.poll(() => signupBody?.referralCode).toBe("abc12345");
    expect(signupBody?.email).toBe("tester@example.org");
  });

  test("API odrzuca jednorazową skrzynkę e-mail", async ({ request }) => {
    const response = await request.post("/api/signup", {
      data: {
        email: "uczen@10minutemail.com",
        password: "tajnehaslo123",
        nick: "TesterTempMail",
        termsAccepted: true,
        ageConfirmed: true,
      },
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain("stałego adresu e-mail");
  });
});
