import { describe, expect, it } from "vitest";
import { isNavLinkVisible, NAV_PRIMARY_LINKS } from "@/lib/layout/nav-links";

describe("authenticated navigation links", () => {
  const reviewLink = NAV_PRIMARY_LINKS.find(
    (link) => link.href === "/powtorki",
  );

  it("hides Powtórki from guests and shows it to signed-in users", () => {
    expect(reviewLink).toBeDefined();
    if (!reviewLink) throw new Error("Powtórki link is missing");
    expect(reviewLink.requiresAuth).toBe(true);
    expect(isNavLinkVisible(reviewLink, false)).toBe(false);
    expect(isNavLinkVisible(reviewLink, true)).toBe(true);
  });

  it("keeps public links visible to guests", () => {
    expect(isNavLinkVisible({ href: "/cennik", label: "Cennik" }, false)).toBe(
      true,
    );
  });
});
