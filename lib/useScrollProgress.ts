"use client";

import { useEffect, useMemo, useState } from "react";
import { STORY_SCENE_VH, type StorySceneId } from "@/lib/flywheelData";
import { buildSceneRanges, clamp01, remap, type SceneRange } from "@/lib/animationUtils";

type ScrollState = {
  progress: number;
  ranges: SceneRange<StorySceneId>[];
  sceneProgress: Record<StorySceneId, number>;
};

function createSceneProgress(ranges: SceneRange<StorySceneId>[], progress: number) {
  const map = {} as Record<StorySceneId, number>;
  for (const range of ranges) {
    map[range.id] = remap(progress, range.start, range.end);
  }
  return map;
}

export function useScrollProgress() {
  const ranges = useMemo(() => buildSceneRanges(STORY_SCENE_VH), []);

  const [state, setState] = useState<ScrollState>(() => ({
    progress: 0,
    ranges,
    sceneProgress: createSceneProgress(ranges, 0),
  }));

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = clamp01(window.scrollY / max);
      setState((prev) => {
        if (Math.abs(prev.progress - progress) < 0.0005) return prev;
        return {
          progress,
          ranges,
          sceneProgress: createSceneProgress(ranges, progress),
        };
      });
    };

    const queue = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [ranges]);

  return state;
}
