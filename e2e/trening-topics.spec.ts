import { expect, test } from "@playwright/test";

test.describe("Trening - pełny zakres tematów", () => {
  test("liceum 3 widzi funkcję kwadratową i wszystkie działy CKE", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("szybka-matma-school-class", "liceum-3");
      localStorage.setItem("szybka-matma-learning-path", "srednia");
    });

    await page.goto("/trening");
    await expect(page.getByRole("heading", { name: "Trening" })).toBeVisible();

    // Plan klasy nie może filtrować treningu: funkcja kwadratowa jest w
    // programie liceum 2, a nie w planie liceum 3.
    await page.getByLabel("Szukaj tematu").fill("funkcja kwadratowa");

    await expect(
      page.getByText("Funkcja kwadratowa", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/Znaleziono 1 temat/)).toBeVisible();
  });

  test("przełącznik egzaminu podmienia całą listę tematów", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto("/trening");
    await page.getByRole("tab", { name: "Matura podstawowa" }).click();

    const browse = page.getByTestId("training-browse");
    await expect(browse).toContainText("76 tematów");
    await expect(
      page.getByTestId("training-department-navigation"),
    ).toContainText("Liczby rzeczywiste");
  });

  test("wyszukiwarka pokazuje licznik i czyści się jednym kliknięciem", async ({
    page,
  }) => {
    await page.goto("/trening");

    const search = page.getByLabel("Szukaj tematu");
    await search.fill("procenty");
    await expect(page.getByText(/Znaleziono/)).toBeVisible();

    await page.getByRole("button", { name: "Wyczyść wyszukiwanie" }).click();
    await expect(search).toHaveValue("");
  });
});

test.describe("Trening na telefonie", () => {
  test("tematy otwierają się od razu pod klikniętym działem", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/trening");

    const department = page.getByRole("button", {
      name: /Liczby i działania/,
    });
    await expect(department).toBeVisible();
    await department.click();

    const panel = page.getByTestId("training-department-panel");
    const topics = page.getByTestId("training-topic-list");
    await expect(panel).toBeVisible();
    await expect(topics).toBeVisible();

    const buttonBox = await department.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    if (buttonBox && panelBox) {
      // Panel ma być tuż pod przyciskiem, a nie po całej liście działów.
      expect(panelBox.y - (buttonBox.y + buttonBox.height)).toBeLessThan(120);
    }
  });

  test("na starcie nie rozwija wszystkich tematów", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/trening");

    await expect(page.getByTestId("training-topic-list")).toHaveCount(0);
  });
});
