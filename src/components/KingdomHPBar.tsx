import { useEffect, useMemo, useRef, useState } from 'react';

interface KingdomHPBarProps {
  current: number;
  max: number;
}

export function KingdomHPBar({ current, max }: KingdomHPBarProps) {
  // Показываем только если есть урон
  if (current >= max) return null;

  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (current / safeMax) * 100));

  const barColor = useMemo(() => {
    if (pct > 66) return '#4b7c52';
    if (pct > 33) return '#f8d877';
    return '#e93f59';
  }, [pct]);

  // Dota-style “damage delay” layer
  const [delayedPct, setDelayedPct] = useState(pct);
  const lastPctRef = useRef(pct);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = lastPctRef.current;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (pct >= prev) {
      // хил/ремонт: серую полосу подтягиваем сразу
      setDelayedPct(pct);
    } else {
      // урон: догоняем с небольшой задержкой
      timerRef.current = window.setTimeout(() => {
        setDelayedPct(pct);
        timerRef.current = null;
      }, 260);
    }

    lastPctRef.current = pct;
  }, [pct]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Сегменты (каждые 250 HP)
  const segments = Math.max(1, Math.ceil(safeMax / 250));
  const segmentWidth = 100 / segments;

  return (
    <div className="w-full px-2 py-1 bg-[#191520] flex flex-col items-center shrink-0">
      <div className="text-xs font-bold text-[#f0efdf] mb-1 flex items-center gap-1">
        <span>❤️ Королевство:</span>
        <span style={{ color: barColor }}>
          {Math.floor(current)}/{Math.floor(safeMax)}
        </span>
      </div>

      <div className="w-full h-3 bg-[#191520] border border-[#294566] rounded-[1px] relative overflow-hidden max-w-md">
        {/* Фон */}
        <div className="absolute inset-0 bg-[#2a2d3c]" />

        {/* Серая “задержанная” полоса */}
        <div
          className="absolute h-full transition-[width] duration-600 ease-out"
          style={{
            width: `${delayedPct}%`,
            backgroundColor: '#f0efdf',
            opacity: 0.28,
          }}
        />

        {/* Основной HP */}
        <div
          className="absolute h-full transition-[width] duration-160 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
        />

        {/* Сегменты */}
        {Array.from({ length: segments - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-[#191520]"
            style={{ left: `${(i + 1) * segmentWidth}%`, opacity: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}
