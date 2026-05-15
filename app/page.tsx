"use client";

import { FlywheelStory } from "@/components/FlywheelStory";
import { HeroScene } from "@/components/HeroScene";
import { Nav } from "@/components/Nav";
import { OutroScene } from "@/components/OutroScene";
import { ProofCharts } from "@/components/ProofCharts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { TextFlywheelTransition } from "@/components/TextFlywheelTransition";
import { useScrollProgress } from "@/lib/useScrollProgress";

export default function Home() {
  const { sceneProgress } = useScrollProgress();

  return (
    <>
      <div className="grain" aria-hidden />
      <ScrollProgress />
      <Nav />
      <main className="relative z-[1]">
        <HeroScene progress={sceneProgress.hero} />
        <TextFlywheelTransition progress={sceneProgress.textTransition} />
        <FlywheelStory progress={sceneProgress.flywheel} />
        <ProofCharts progress={sceneProgress.proof} />
        <OutroScene progress={sceneProgress.outro} />
      </main>
    </>
  );
}
