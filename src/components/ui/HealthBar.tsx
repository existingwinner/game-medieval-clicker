import { useState, useEffect } from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  size?: 'small' | 'large';
}

export const HealthBar = ({ current, max, size = 'small' }: HealthBarProps) => {
  const [delayedHP, setDelayedHP] = useState(current);

  useEffect(() => {
    if (current < delayedHP) {
      const timer = setTimeout(() => {
        setDelayedHP(current);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setDelayedHP(current);
    }
  }, [current, delayedHP]);

  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const delayedPercent = max > 0 ? Math.max(0, Math.min(100, (delayedHP / max) * 100)) : 0;

  const getColorClass = () => {
    if (percent > 50) return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
    if (percent > 25) return 'bg-gradient-to-r from-amber-600 to-amber-400';
    return 'bg-gradient-to-r from-rose-700 to-rose-500';
  };

  return (
    <div className={`relative bg-black/40 rounded-sm overflow-hidden ${size === 'large' ? 'h-3.5 sm:h-4' : 'h-1.5'} border border-white/5 shadow-inner`}>
      <div
        className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-700 ease-out"
        style={{ width: `${delayedPercent}%` }}
      />
      <div
        className={`absolute top-0 left-0 h-full transition-all duration-150 ease-linear ${getColorClass()}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
