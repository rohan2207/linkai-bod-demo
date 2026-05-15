export function StoryPivot() {
  return (
    <section className="border-y border-[var(--ln)] bg-gradient-to-br from-[rgba(98,62,221,0.07)] to-[rgba(213,81,201,0.04)] px-6 py-[14vh] md:px-[8vw]">
      <div className="max-w-[760px]">
        <p className="mb-6 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-pp">This Quarter&apos;s Story</p>
        <blockquote className="font-serif text-[clamp(1.8rem,3.5vw,3.8rem)] font-light italic leading-tight text-[#D1C1FF]">
          &ldquo;The last two updates led with what LinkAI can do. This quarter, we&apos;re shifting the story to how LinkAI has transformed the way we
          build.&rdquo;
        </blockquote>
        <p className="mt-8 max-w-[620px] text-base font-light leading-relaxed text-[rgba(209,193,255,0.58)]">
          A development cycle that used to crawl in a straight line — now turns as a flywheel. Faster iterations. Constant monitoring. Every stage augmented
          with AI. What follows is each spoke, up close.
        </p>
      </div>
    </section>
  );
}
