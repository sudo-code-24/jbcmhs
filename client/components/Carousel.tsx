"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

export type CarouselSlide = {
  src?: string;
  caption?: string;
  /** Optional gradient overlay when no image (e.g. "from-blue-600 to-slate-700") */
  gradient?: string;
};

const DEFAULT_SLIDES: CarouselSlide[] = [
  { gradient: "from-blue-700 to-slate-700", caption: "Welcome to Our School" },
  { gradient: "from-sky-600 to-blue-700", caption: "Excellence in Education" },
  { gradient: "from-slate-600 to-sky-800", caption: "Building Tomorrow's Leaders" },
];

const INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 50;

type Props = {
  slides?: CarouselSlide[];
  interval?: number;
};

export default function Carousel({ slides = DEFAULT_SLIDES, interval = INTERVAL_MS }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback(
    (i: number) => {
      setIndex((prev) => {
        if (i < 0) return slides.length - 1;
        if (i >= slides.length) return 0;
        return i;
      });
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [paused, interval, slides.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setPaused(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) next();
      else prev();
    }
    setPaused(false);
  }, [next, prev]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl bg-muted shadow-lg touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[280px] w-full sm:h-[360px] md:h-[420px] lg:max-h-[500px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-500 ease-in-out"
            style={{
              opacity: i === index ? 1 : 0,
              pointerEvents: i === index ? "auto" : "none",
            }}
          >
            {slide.src ? (
              <img
                src={slide.src}
                alt={slide.caption || `Slide ${i + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                  slide.gradient || "from-slate-600 to-slate-800"
                }`}
              />
            )}
            {slide.caption && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <p className="text-center text-2xl font-semibold text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                  {slide.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <Button
        type="button"
        onClick={prev}
        variant="secondary"
        size="icon"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-md"
        aria-label="Previous slide"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      <Button
        type="button"
        onClick={next}
        variant="secondary"
        size="icon"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-md"
        aria-label="Next slide"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <Button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            variant="ghost"
            size="icon"
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
