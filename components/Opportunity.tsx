export function Opportunity() {
  return (
    <section className="relative px-6 py-[14vh] md:px-[8vw]">
      <div className="absolute left-[8vw] right-[8vw] top-0 h-px bg-gradient-to-r from-transparent via-[var(--ln)] to-transparent" />
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-[6vw]">
        <div>
          <p className="mb-6 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-pp">The Opportunity</p>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,5.5rem)] font-light leading-[1.05] tracking-tight">
            Technology
            <br />
            now advances
            <br />
            at the speed
            <br />
            of{" "}
            <strong className="bg-gradient-to-r from-[#D1C1FF] to-pp bg-clip-text font-normal text-transparent">
              intelligence.
            </strong>
          </h2>
        </div>
        <div className="flex flex-col gap-10">
          {[
            {
              n: "01",
              t: "AI compresses the distance between idea and execution. The same team now produces meaningfully more — without adding headcount or budget.",
            },
            {
              n: "02",
              t: "Mortgage is ripe for disruption. Complex workflows, high scrutiny, and a fragmented vendor landscape create enormous opportunity for teams who can move faster and consolidate smarter.",
            },
            {
              n: "03",
              t: "LinkAI and AI together are helping us compress that vendor footprint — replacing legacy desktop tools with a scalable, modern platform built for how our people actually work.",
            },
          ].map((item) => (
            <div
              key={item.n}
              className="border-l border-[var(--ln)] pl-7 transition-[border-color] duration-300 hover:border-pm"
            >
              <p className="mb-2 text-[0.58rem] uppercase tracking-[0.25em] text-[var(--mu)]">{item.n}</p>
              <p className="text-base font-light leading-relaxed text-[rgba(240,236,255,0.82)]">{item.t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
