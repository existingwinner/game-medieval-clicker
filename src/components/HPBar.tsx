import { useEffect, useMemo, useRef, useState } from 'react';

interface HPBarProps {
  current: number;
  max: number;
  showAlways?: boolean;
}

export function HPBar({ current, max, showAlways = false }: HPBarProps) {
  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (current / safeMax) * 100));
  const isDamaged = current < safeMax;

  if (!showAlways && !isDamaged) return null;

  // Dota-style “damage delay” layer: серая полоса отстаёт при получении урона
  const [delayedPct, setDelayedPct] = useState(pct);
  const lastPctRef = useRef(pct);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = lastPctRef.current;

    // Очистим таймер
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (pct >= prev) {
      // Хил/починка: серую полосу подтягиваем сразу
      setDelayedPct(pct);
    } else {
      // Урон: серую полосу догоняем с задержкой и плавно
      timerRef.current = window.setTimeout(() => {
        setDelayedPct(pct);
        timerRef.current = null;
      }, 220);
    }

    lastPctRef.current = pct;
  }, [pct]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const barColor = useMemo(() => {
    if (pct > 66) return '#4b7c52';
    if (pct > 33) return '#f8d877';
    return '#e93f59';
  }, [pct]);

  // Сегменты (каждые 25 HP = 1 сегмент)
  const segments = Math.max(1, Math.ceil(safeMax / 25));
  const segmentWidth = 100 / segments;

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[82%] h-1.5 bg-[#191520] border border-[#294566] rounded-[1px] overflow-hidden">
      {/* Фон */}
      <div className="absolute inset-0 bg-[#2a2d3c]" />

      {/* Серая “задержанная” полоса (под основной), как в Dota */}
      <div
        className="absolute h-full transition-[width] duration-500 ease-out"
        style={{
          width: `${delayedPct}%`,
          backgroundColor: '#f0efdf',
          opacity: 0.28,
        }}
      />

      {/* Основной HP */}
      <div
        className="absolute h-full transition-[width] duration-140 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: barColor,
        }}
      />

      {/* Сегменты */}
      {Array.from({ length: segments - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-full w-px bg-[#191520]"
          style={{ left: `${(i + 1) * segmentWidth}%`, opacity: 0.65 }}
        />
      ))}
    </div>
  );
}
