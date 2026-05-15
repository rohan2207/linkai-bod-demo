import { LogoMark } from "@/components/LogoMark";

export function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-[150] flex items-center justify-between bg-gradient-to-b from-[rgba(12,9,22,0.92)] to-transparent px-6 py-7 md:px-12">
      <div id="nav-logo-anchor" className="w-[100px] md:w-[110px]">
        <LogoMark className="h-auto w-full" />
      </div>
      <span className="text-[0.63rem] uppercase tracking-[0.22em] text-[var(--mu)]">
        Board of Directors · Q1 2026
      </span>
    </nav>
  );
}
