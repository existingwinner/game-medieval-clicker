import { forwardRef } from 'react';
import { Castle as CastleIcon, Crown } from 'lucide-react';
import { HealthBar } from '../ui/HealthBar';

interface CastleProps {
  castleHP: number;
  maxCastleHP: number;
  gameOver: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const Castle = forwardRef<HTMLButtonElement, CastleProps>(
  ({ castleHP, maxCastleHP, gameOver, onClick, onKeyDown }, ref) => {
    return (
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-12 group">
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-1000" />
          {/* Shadow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-24 bg-black/40 rounded-[100%] blur-[40px] translate-y-32 scale-x-125" />
          
          <button
            ref={ref}
            onClick={onClick}
            onKeyDown={onKeyDown}
            disabled={gameOver}
            className={`relative z-10 flex flex-col items-center transition-all duration-500 active:scale-95 ${
              gameOver ? 'opacity-20 grayscale' : 'hover:-translate-y-2'
            }`}
          >
            <div className="relative drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]">
              <CastleIcon className="w-48 h-48 sm:w-64 sm:h-64 text-stone-300/90" strokeWidth={1.2} />
              <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 text-amber-500/40 animate-pulse" />
            </div>
            <div className="mt-8 px-10 py-2.5 bg-stone-950/40 backdrop-blur-xl rounded-full border border-white/5">
              <span className="text-stone-300 text-xs font-bold tracking-[0.4em] uppercase opacity-60">
                Цитадель
              </span>
            </div>
          </button>
        </div>

        {/* Health Bar Card */}
        <div className="w-72 sm:w-96 bg-stone-950/20 backdrop-blur-xl p-6 rounded-[2rem] border border-white/[0.03] shadow-2xl">
          <div className="flex justify-between items-center mb-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300">
            <span>Целостность</span>
            <span className="text-stone-300/80">
              {Math.ceil(castleHP)} / {maxCastleHP}
            </span>
          </div>
          <HealthBar current={castleHP} max={maxCastleHP} size="large" />
        </div>
      </div>
    );
  }
);

Castle.displayName = 'Castle';
