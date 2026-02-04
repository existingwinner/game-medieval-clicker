import { motion } from 'framer-motion';
import { Hammer, Skull, Wrench } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';

interface FloatingControlsProps {
  showBuildings: boolean;
  showRaid: boolean;
  needsRepair: boolean;
  repairCost: number;
  onToggleBuildings: () => void;
  onToggleRaid: () => void;
  onRepairAll: () => void;
}

export const FloatingControls = ({
  showBuildings,
  showRaid,
  needsRepair,
  repairCost,
  onToggleBuildings,
  onToggleRaid,
  onRepairAll
}: FloatingControlsProps) => {
  return (
    <div className="fixed bottom-10 left-0 right-0 flex justify-center items-center pointer-events-none z-40 px-4">
      <div className="flex items-center space-x-4 sm:space-x-8 pointer-events-auto bg-stone-950/60 backdrop-blur-2xl px-4 py-4 rounded-[2.5rem] border border-white/5 shadow-2xl">
        {/* Buildings button */}
        <button
          onClick={onToggleBuildings}
          className={`p-4 rounded-2xl transition-all duration-500 border ${
            showBuildings
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-white/5 text-stone-300 hover:text-stone-300 border-white/5'
          }`}
        >
          <Hammer className="w-6 h-6" strokeWidth={1.5} />
        </button>

        {/* Repair button */}
        {needsRepair && !showBuildings && !showRaid && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onRepairAll}
            className="flex flex-col items-center px-10 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/30 transition-all"
          >
            <div className="flex items-center text-emerald-400 font-bold text-[10px] uppercase tracking-[0.3em]">
              <Wrench className="w-4 h-4 mr-3 opacity-60" /> Ремонт
            </div>
            <div className="text-[9px] text-emerald-500/60 font-bold mt-1 tabular-nums">
              💰{formatNumber(repairCost)}
            </div>
          </motion.button>
        )}

        {/* Raid button */}
        <button
          onClick={onToggleRaid}
          className={`p-4 rounded-2xl transition-all duration-500 border ${
            showRaid
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-white/5 text-stone-300 hover:text-stone-300 border-white/5'
          }`}
        >
          <Skull className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
