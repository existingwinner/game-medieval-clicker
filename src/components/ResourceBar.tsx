import { Resources } from '../types/game';
import { useEffect, useRef, useCallback, useState } from 'react';
import { VolumeControl } from './ui/VolumeControl';

interface ResourceBarProps {
  resources: Resources;
  wave: number;
  timeToRaid: number;
  isRaidActive: boolean;
}

interface ResourceItemProps {
  emoji: string;
  value: number;
  id: string;
}

// Компонент для плавного "подбрасывающего" изменения чисел
function AnimatedValue({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(Math.floor(value));
  const [animatingDigits, setAnimatingDigits] = useState<Set<number>>(new Set());
  const animationRef = useRef<number | null>(null);
  const prevValueRef = useRef(Math.floor(value));

  useEffect(() => {
    const targetValue = Math.floor(value);
    const startValue = prevValueRef.current;
    
    if (targetValue === startValue) return;
    
    // Отменяем предыдущую анимацию
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const diff = targetValue - startValue;
    const duration = Math.min(300, Math.abs(diff) * 50); // Быстрее для маленьких изменений
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuart - быстрый старт, плавный финиш
      const eased = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.round(startValue + diff * eased);
      const prevDisplay = displayValue;
      
      setDisplayValue(current);
      
      // Определяем какие цифры изменились для анимации подбрасывания
      const currentStr = current.toString();
      const prevStr = prevDisplay.toString();
      const changed = new Set<number>();
      
      for (let i = 0; i < currentStr.length; i++) {
        if (currentStr[i] !== prevStr[i]) {
          changed.add(i);
        }
      }
      if (changed.size > 0) {
        setAnimatingDigits(changed);
        setTimeout(() => setAnimatingDigits(new Set()), 100);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        prevValueRef.current = targetValue;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  const digits = displayValue.toString().split('');

  return (
    <span className="inline-flex">
      {digits.map((digit, index) => (
        <span
          key={index}
          className={`inline-block ${animatingDigits.has(index) ? 'animate-digit-bounce' : ''}`}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

function ResourceItem({ emoji, value, id }: ResourceItemProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);

  // Функция для запуска анимации pulse (подпрыгивание иконки)
  const triggerPulse = useCallback(() => {
    const el = elRef.current;
    if (!el) return;

    // Очищаем предыдущий таймер
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    // Перезапуск CSS-анимации
    el.classList.remove('animate-resource-pulse');
    void el.offsetWidth; // reflow
    el.classList.add('animate-resource-pulse');

    cleanupTimerRef.current = window.setTimeout(() => {
      el.classList.remove('animate-resource-pulse');
      cleanupTimerRef.current = null;
    }, 260);
  }, []);

  // Синхронизация с "прилётом" FloatingNumber
  useEffect(() => {
    const handleArrive = (e: Event) => {
      const ce = e as CustomEvent<{ type: string; amount: number }>;
      if (!ce.detail) return;
      if (ce.detail.type !== id) return;
      triggerPulse();
    };

    window.addEventListener('resourceArrived', handleArrive);
    return () => {
      window.removeEventListener('resourceArrived', handleArrive);
    };
  }, [id, triggerPulse]);

  // Cleanup таймера на размонтирование
  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) {
        window.clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elRef}
      id={`resource-${id}`}
      className="flex items-center gap-1 px-1.5 py-1 bg-[#2a2d3c] rounded border border-[#294566] will-change-transform"
    >
      <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1.25rem)' }}>{emoji}</span>
      <span className="text-[#f8d877] font-bold" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1rem)' }}>
        <AnimatedValue value={value} />
      </span>
    </div>
  );
}

export function ResourceBar({ resources, wave, timeToRaid, isRaidActive }: ResourceBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#191520] border-b-2 border-[#294566] px-2 py-1.5">
      <div className="flex justify-between items-center gap-1.5">
        {/* Ресурсы */}
        <div className="flex gap-1 flex-wrap">
          <ResourceItem emoji="💰" value={resources.gold} id="gold" />
          <ResourceItem emoji="🪵" value={resources.wood} id="wood" />
          <ResourceItem emoji="🪨" value={resources.stone} id="stone" />
          <ResourceItem emoji="✨" value={resources.determination} id="determination" />
        </div>
        
        {/* Волна и таймер */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
            isRaidActive 
              ? 'bg-[#e93f59] border-[#723738] animate-pulse' 
              : 'bg-[#2a2d3c] border-[#294566]'
          }`}>
            <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1.25rem)' }}>
              {isRaidActive ? '⚔️' : '🛡️'}
            </span>
            <div className="text-right">
              <div className="text-[#f0efdf] font-bold leading-tight" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.875rem)' }}>
                {wave}/99
              </div>
              <div className="text-[#ffa057] font-bold leading-tight" style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)' }}>
                {isRaidActive ? 'БОЙ!' : formatTime(timeToRaid)}
              </div>
            </div>
          </div>
          
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
