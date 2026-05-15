"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/LogoMark";

type Box = { top: number; left: number; width: number };

export function Outro() {
  const sectionRef = useRef<HTMLElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "fly" | "done">("idle");
  const [from, setFrom] = useState<Box | null>(null);
  const [to, setTo] = useState<Box | null>(null);
  const reduce = useReducedMotion();
  const flyTriggered = useRef(false);

  useEffect(() => {
    if (reduce) {
      setPhase("done");
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || flyTriggered.current) return;
        const nav = document.getElementById("nav-logo-anchor");
        const target = targetRef.current;
        if (!nav || !target) return;
        flyTriggered.current = true;
        const nr = nav.getBoundingClientRect();
        const tr = target.getBoundingClientRect();
        const w = 240;
        setFrom({ top: nr.top, left: nr.left, width: nr.width });
        setTo({ top: tr.top, left: tr.left + (tr.width - w) / 2, width: w });
        nav.style.opacity = "0";
        nav.style.transition = "opacity 0.2s ease";
        setPhase("fly");
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (phase !== "done") return;
    const nav = document.getElementById("nav-logo-anchor");
    if (nav) {
      nav.style.opacity = "1";
    }
  }, [phase]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-[14vh] text-center md:px-[8vw]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,rgba(98,62,221,0.15),rgba(213,81,201,0.06)_50%,transparent_70%)]" />
      <div className="relative z-[1] flex flex-col items-center">
        <div ref={targetRef} className="mb-16 flex h-[88px] w-[240px] items-center justify-center">
          {phase === "done" ? (
            <LogoMark className="h-auto w-full" />
          ) : (
            <span className="sr-only">Logo landing zone</span>
          )}
        </div>

        {phase === "fly" && from && to ? (
          <motion.div
            className="fixed z-[300] pointer-events-none"
            initial={{ top: from.top, left: from.left, width: from.width }}
            animate={{ top: to.top, left: to.left, width: to.width }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
            onAnimationComplete={() => setPhase("done")}
          >
            <div className="logo-flip-3d">
              <LogoMark className="h-auto w-full" />
            </div>
          </motion.div>
        ) : null}

        <p className="mb-12 text-[0.68rem] uppercase tracking-[0.3em] text-[var(--mu)]">The mortgage platform that thinks ahead</p>
        <blockquote className="max-w-[700px] font-serif text-[clamp(2rem,4vw,4rem)] font-light italic leading-tight text-[#D1C1FF]">
          We are not catching up
          <br />
          to the future.
          <br />
          We are building it.
        </blockquote>
        <p className="mt-16 text-[0.62rem] uppercase tracking-[0.25em] text-[rgba(209,193,255,0.2)]">
          Mortgage Technology · Q1 2026 · Board of Directors
        </p>
      </div>
      <style jsx global>{`
        .logo-flip-3d {
          transform-style: preserve-3d;
          animation: logoFlip3d 0.9s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }
        @keyframes logoFlip3d {
          0% {
            transform: rotateY(0deg) rotateX(0deg) scale(1);
          }
          40% {
            transform: rotateY(90deg) rotateX(10deg) scale(0.85);
          }
          100% {
            transform: rotateY(0deg) rotateX(0deg) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
