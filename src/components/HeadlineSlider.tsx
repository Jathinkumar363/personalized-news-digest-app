import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Flame } from 'lucide-react';
import type { Article } from '@/types';

const MIN_SLIDES = 5;
const MAX_SLIDES = 10;

const INDIA_IMG =
  'https://images.pexels.com/photos/19883686/pexels-photo-19883686.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const topicLabel: Record<string, string> = {
  ai: 'AI',
  technology: 'Technology',
  sports: 'Sports',
  politics: 'Politics',
  business: 'Business',
  science: 'Science',
  india: 'India',
  world: 'World',
};

export default function HeadlineSlider({ headlines }: { headlines: Article[] }) {
  const slides = headlines.slice(0, MAX_SLIDES);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);

  const count = slides.length;

  const go = (i: number) => setCurrent((i + count) % count);
  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % count), 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count]);

  if (count < MIN_SLIDES) return null;

  const active = slides[current];
  const img = active.image_url || INDIA_IMG;
  const isIndia = active.region === 'india';

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images stacked for crossfade */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image_url || INDIA_IMG}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative flex min-h-[340px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
            <Flame className="h-3.5 w-3.5" />
            Top Stories
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isIndia ? 'bg-orange-500 text-white' : 'bg-white/90 text-gray-900'
            }`}
          >
            {isIndia ? 'India' : 'World'}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {topicLabel[active.topic] ?? active.topic}
          </span>
        </div>

        <h2 className="mt-4 max-w-2xl text-xl font-extrabold leading-tight text-white sm:text-3xl">
          {active.title}
        </h2>
        {active.summary[0] && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-200 sm:text-base">
            {active.summary[0]}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-medium text-gray-300">{active.source_name}</span>
          <a
            href={active.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-900 transition-transform hover:scale-105"
          >
            Read full story
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-6 z-10 flex gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
