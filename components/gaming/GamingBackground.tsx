type GamingBackgroundProps = {
  variant?: "default" | "hero";
};

export function GamingBackground({ variant = "default" }: GamingBackgroundProps) {
  const hero = variant === "hero";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 120% 80% at 50% -10%, #000 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 120% 80% at 50% -10%, #000 0%, transparent 72%)",
        }}
      >
        <div
          className={`absolute rounded-full bg-amber-500/[0.08] blur-[120px] ${
            hero
              ? "-left-[10%] top-0 h-[min(520px,55vw)] w-[min(520px,55vw)]"
              : "-left-20 top-10 h-72 w-72"
          }`}
        />
        <div
          className={`absolute rounded-full bg-orange-400/[0.05] blur-[130px] ${
            hero
              ? "right-[-8%] top-[8%] h-[min(480px,50vw)] w-[min(480px,50vw)]"
              : "right-0 top-1/4 h-80 w-80"
          }`}
        />
        <div
          className={`absolute rounded-full bg-amber-600/[0.06] blur-[140px] ${
            hero
              ? "bottom-[-15%] left-[20%] h-[min(440px,48vw)] w-[min(440px,48vw)]"
              : "bottom-0 left-1/3 h-64 w-64"
          }`}
        />
      </div>
    </div>
  );
}
