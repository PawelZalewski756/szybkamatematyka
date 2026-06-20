/** Delikatne tło strony głównej — bez dekoracji po bokach. */
export function HomeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-0 h-[480px] w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-teal-600/[0.07] blur-[100px]" />
    </div>
  );
}
