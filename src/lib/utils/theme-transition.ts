/**
 * Animate a bottom-to-top sweep that visually introduces the target theme.
 * Uses GPU-friendly transforms and rAF sequencing to avoid paint races.
 */
export const animateThemeSweep = (
  targetTheme: "light" | "dark",
  onSwitchTheme: () => void,
) => {
  if (typeof window === "undefined") {
    onSwitchTheme();
    return;
  }

  const SWEEP_MS = 700;
  const FADE_MS = 180;

  // While sweeping, temporarily disable CSS transitions to prevent
  // underlying components from animating their colors independently.
  const root = document.documentElement;
  root.classList.add("theme-sweep-active");

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "theme-sweep-overlay";

  // Highest z-index to ensure it sits above any UI, and no interaction
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.pointerEvents = "none";

  // Color the overlay using the CURRENT theme background so we are
  // guaranteed to match exactly, regardless of token values.
  const computedBg = getComputedStyle(root)
    .getPropertyValue("--background")
    .trim();
  overlay.style.background =
    computedBg ||
    (targetTheme === "light" ? "hsl(240 7.7% 7.1%)" : "oklch(1 0 0)");

  // Transform-based sweep from bottom to top
  overlay.style.transformOrigin = "bottom center";
  overlay.style.transform = "scaleY(1) translateZ(0)";
  overlay.style.opacity = "1";
  overlay.style.transition = `transform ${SWEEP_MS}ms cubic-bezier(.2,.8,.2,1), opacity ${FADE_MS}ms ease`;

  document.body.appendChild(overlay);

  // Two-phase rAF to ensure: 1) overlay paints covering old theme,
  // 2) theme switches, 3) then sweep animates revealing the new theme.
  requestAnimationFrame(() => {
    // Switch theme while overlay fully covers content
    onSwitchTheme();

    requestAnimationFrame(() => {
      overlay.style.transform = "scaleY(0) translateZ(0)";

      window.setTimeout(() => {
        overlay.style.opacity = "0";
        window.setTimeout(() => {
          overlay.remove();
          root.classList.remove("theme-sweep-active");
        }, FADE_MS);
      }, SWEEP_MS);
    });
  });
};
