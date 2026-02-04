import { useEffect, useRef } from 'react';
import { FloatingNumber } from '../types/game';

interface FloatingNumbersProps {
  numbers: FloatingNumber[];
  onComplete: (id: string) => void;
}

export function FloatingNumbers({ numbers, onComplete }: FloatingNumbersProps) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {numbers.map(n => (
        <FloatItem key={n.id} data={n} onComplete={onComplete} />
      ))}
    </div>
  );
}

function formatNumber(v: number): string {
  if (Number.isInteger(v)) return String(v);
  const rounded = Math.round(v * 100) / 100;
  return String(rounded);
}

function FloatItem({ data, onComplete }: { data: FloatingNumber; onComplete: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  // Определяем тип анимации
  const isClickAnimation = data.mode === 'up'; // Клик по замку
  const isPassiveAnimation = data.mode === 'toResource'; // Пассивный доход
  const isNegativeAnimation = data.mode === 'down'; // Кража

  useEffect(() => {
    const el = ref.current;
    if (!el || animatedRef.current) return;
    animatedRef.current = true;

    // Начальная позиция - для пассивного дохода строго по центру, для клика - с разбросом
    const startX = isPassiveAnimation ? data.startX : data.startX + (Math.random() - 0.5) * 30;
    const startY = isPassiveAnimation ? data.startY : data.startY + (Math.random() - 0.5) * 15;

    // Устанавливаем начальную позицию
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    let duration = 1000;

    if (isClickAnimation) {
      // Клик по замку - простая анимация вверх
      el.classList.add('animate-float-click');
      duration = 800;
    } else if (isPassiveAnimation) {
      // Пассивный доход - cartoon bounce анимация
      el.classList.add('animate-float-cartoon');
      duration = 1200;
      
      // Отправляем событие когда число "приземляется" (на пике подпрыгивания ~30%)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('resourceArrived', { 
          detail: { type: data.resourceType, amount: data.value }
        }));
      }, duration * 0.30);
    } else if (isNegativeAnimation) {
      // Кража - падение вниз
      el.style.transform = 'translate(-50%, -50%) scale(1)';
      el.style.opacity = '1';
      
      setTimeout(() => {
        el.style.transition = 'transform 600ms ease-in, opacity 600ms ease-in';
        el.style.transform = 'translate(-50%, -50%) translateY(50px) scale(0.7)';
        el.style.opacity = '0';
      }, 10);
      
      duration = 650;
    }

    // Удаляем после анимации
    const timer = setTimeout(() => {
      onComplete(data.id);
    }, duration + 50);

    return () => clearTimeout(timer);
  }, [data, onComplete, isClickAnimation, isPassiveAnimation, isNegativeAnimation]);

  const getColor = () => {
    if (data.isNegative) return '#e93f59';
    switch (data.resourceType) {
      case 'gold': return '#f8d877';
      case 'wood': return '#a0b035';
      case 'stone': return '#85c4d7';
      case 'determination': return '#9653a2';
      default: return '#f0efdf';
    }
  };

  const getEmoji = () => {
    switch (data.resourceType) {
      case 'gold': return '🪙';
      case 'wood': return '🪵';
      case 'stone': return '🪨';
      case 'determination': return '⚔️';
      default: return '';
    }
  };

  // Определяем размер шрифта
  const getFontSize = () => {
    if (isNegativeAnimation) return 'clamp(0.75rem, 2.5vw, 0.9rem)'; // Кража - маленький
    if (isClickAnimation) return 'clamp(1.25rem, 5vw, 1.75rem)'; // Замок - большой
    return 'clamp(0.7rem, 2.2vw, 0.85rem)'; // Пассивный доход - маленький
  };

  // Определяем содержимое
  const getContent = () => {
    if (isClickAnimation) {
      // Замок - только эмодзи монетки
      return getEmoji();
    } else if (isPassiveAnimation) {
      // Пассивный доход - только число без эмодзи
      return `+${formatNumber(data.value)}`;
    } else if (isNegativeAnimation) {
      // Кража - число с минусом и эмодзи
      return `-${formatNumber(data.value)} 💸`;
    }
    return `+${formatNumber(data.value)}`;
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        color: getColor(),
        fontWeight: 'bold',
        fontSize: getFontSize(),
        textShadow: '1px 1px 0 #191520, -1px -1px 0 #191520, 1px -1px 0 #191520, -1px 1px 0 #191520',
        whiteSpace: 'nowrap',
        opacity: 0,
        willChange: 'transform, opacity',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {getContent()}
    </div>
  );
}
