/**
 * Navbar offset for sticky sidebars - keep in sync with `app/globals.css`:
 * `--nav-height-desktop` (4.5rem) and `--nav-height-mobile` (9.5rem).
 */
export const NAVBAR_OFFSET_DESKTOP = "var(--nav-height-desktop)" as const;
export const NAVBAR_OFFSET_MOBILE = "var(--nav-height-mobile)" as const;

/** 4.5rem at 16px root - matches `--nav-height-desktop`. */
export const NAVBAR_OFFSET_DESKTOP_PX = 72;
