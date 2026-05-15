import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden pb-[10vh] pl-6 pr-6 pt-24 md:px-[8vw]">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 70% 30%, rgba(98,62,221,.2) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 20% 80%, rgba(213,81,201,.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 90%, rgba(255,131,0,.08) 0%, transparent 60%),
            #0c0916`,
        }}
      />
      <div className="orb absolute -right-[5%] -top-[10%] h-[500px] w-[500px] animate-drift rounded-full bg-[rgba(98,62,221,.14)] blur-[80px]" />
      <div className="orb absolute right-[30%] top-[40%] h-[300px] w-[300px] animate-drift-slow rounded-full bg-[rgba(213,81,201,.10)] blur-[80px] [animation-delay:-8s]" />
      <div className="orb absolute bottom-[10%] left-[15%] h-[250px] w-[250px] animate-drift-mid rounded-full bg-[rgba(255,131,0,.08)] blur-[80px] [animation-delay:-4s]" />
      <div className="relative z-[1]">
        <p className="mb-8 text-[0.68rem] uppercase tracking-[0.28em] text-[var(--mu)]">
          Mortgage Technology · Q1 2026 Update
        </p>
        <h1 className="max-w-[900px] font-serif text-[clamp(3.5rem,7.5vw,8rem)] font-light leading-[0.95] tracking-tight">
          We are building
          <br />
          in the{" "}
          <em className="bg-gradient-to-br from-white via-pp to-pa bg-clip-text not-italic text-transparent">Age of AI.</em>
          <br />
          Everything is faster now.
        </h1>
        <p className="mt-12 max-w-[480px] text-base font-light leading-relaxed text-[rgba(240,236,255,0.72)]">
          The pace of advancement is no longer linear. Mortgage is a high-scrutiny industry with enormous opportunity — and the right tools let the same team move faster, do more, and compress the vendor footprint that has historically slowed us down.
        </p>
      </div>
      <div className="absolute bottom-12 right-6 z-[1] flex flex-col items-center gap-2 opacity-35 md:right-16">
        <ArrowDown className="size-3.5" strokeWidth={1.5} />
        <span className="text-[0.6rem] uppercase tracking-[0.2em]">Scroll</span>
      </div>
    </section>
  );
}
