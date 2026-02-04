import { Skull, Share2, X } from 'lucide-react';
import { Raid } from '../../types';

interface RaidPanelProps {
  isOpen: boolean;
  onClose: () => void;
  raid: Raid;
  gameOver: boolean;
  onShare: () => void;
}

export const RaidPanel = ({ isOpen, onClose, raid, gameOver, onShare }: RaidPanelProps) => {
  return (
    <div
      className={`fixed top-16 right-0 h-[calc(100vh-4rem)] bg-[#0d0a0a]/95 border-l border-white/5 backdrop-blur-2xl transform transition-transform duration-500 ease-out z-30 w-full sm:w-80 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-sm font-bold text-rose-200 uppercase tracking-[0.3em] flex items-center gap-3">
          <Skull className="w-4 h-4 text-rose-400" /> Угроза
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-all text-stone-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Goblin counter */}
        <div className="bg-black/20 p-6 rounded-3xl border border-white/[0.02] space-y-5">
          <div className="flex justify-between items-end">
            <span className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.2em]">
              Численность
            </span>
            <span className="text-rose-300 text-3xl font-bold tabular-nums">
              {raid.active ? raid.goblins : raid.nextGoblins}
            </span>
          </div>
          <div className="h-2 bg-stone-900 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-100 ease-linear ${
                raid.active ? 'bg-rose-600' : 'bg-amber-600/40'
              }`}
              style={{
                width: `${raid.active ? (raid.duration / 15) * 100 : raid.progress}%`
              }}
            />
          </div>
        </div>

        {/* Wave counter */}
        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.03] text-center">
          <div className="text-stone-300 text-[10px] uppercase font-bold tracking-widest mb-2 font-sans">
            Волна
          </div>
          <div className="text-3xl font-bold text-amber-300 tabular-nums">
            {raid.wave}
          </div>
        </div>

        {/* Share button */}
        {!gameOver && (
          <button
            onClick={onShare}
            className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl font-bold text-xs uppercase tracking-[0.2em] border border-white/5 flex items-center justify-center gap-3 transition-all"
          >
            <Share2 className="w-4 h-4 text-stone-300" /> Поделиться
          </button>
        )}
      </div>
    </div>
  );
};
