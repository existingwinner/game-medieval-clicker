import { Skull } from 'lucide-react';

interface GameOverScreenProps {
  isGameOver: boolean;
  wave: number;
  onRestart: () => void;
}

export const GameOverScreen = ({ isGameOver, wave, onRestart }: GameOverScreenProps) => {
  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-stone-950 border border-rose-900/40 rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl">
        <Skull className="w-20 h-20 mx-auto text-rose-600 mb-6 drop-shadow-[0_0_20px_rgba(225,29,72,0.5)]" />
        <h2 className="text-2xl font-bold text-rose-100 tracking-[0.2em] uppercase mb-2">
          Цитадель пала
        </h2>
        <div className="text-4xl font-bold text-amber-500/80 mb-10 tabular-nums">
          {wave}
          <span className="text-[10px] block opacity-40 uppercase tracking-[0.3em] mt-2">
            Выдержано волн
          </span>
        </div>
        <button
          onClick={onRestart}
          className="w-full py-4 bg-stone-100 text-stone-950 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl"
        >
          Возрождение
        </button>
      </div>
    </div>
  );
};
