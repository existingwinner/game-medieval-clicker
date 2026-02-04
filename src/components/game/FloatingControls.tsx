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
  onPassiveIncome?: (income: number, startX: number, startY: number) => void; // НОВАЯ ФУНКЦИЯ
  passiveIncome?: number; // НОВЫЙ ПРОПС
}

export const FloatingControls = ({
  showBuildings,
  showRaid,
  needsRepair,
  repairCost,
  onToggleBuildings,
  onToggleRaid,
  onRepairAll,
  onPassiveIncome,
  passiveIncome = 0
}: FloatingControlsProps) => {
  
  // Обработчик клика для пассивного дохода
  const handlePassiveIncomeClick = () => {
    if (onPassiveIncome && passiveIncome > 0) {
      const buttonRect = document.querySelector('[data-passive-income]')?.getBoundingClientRect();
      if (buttonRect) {
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;
        onPassiveIncome(passiveIncome, startX, startY);
      }
    }
  };

  return (
    <div className="fixed bottom-10 left-0 right-0 flex justify-center items-center pointer-events-none z-40 px-4">
      <div className="flex items-center space-x-4 sm:space-x-8 pointer-events-auto bg-stone-950/60 backdrop-blur-2xl px-4 py-4 rounded-[2.5rem] border border-white/5 shadow-2xl">
        {/* Buildings button */}
        <button
          onClick={onToggleBuildings}
          className={`p-4 rounded-2xl transition-all duration-500 border ${
            showBuildings
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 text-stone-400 hover:text-stone-200 border-white/5'
          }`}
        >
          <Hammer className="w-6 h-6" strokeWidth={1.5} />
        </button>

        {/* Passive Income button - только если есть пассивный доход */}
        {passiveIncome > 0 && !showBuildings && !showRaid && (
          <motion.button
            data-passive-income
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handlePassiveIncomeClick}
            className="flex flex-col items-center px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-2xl border border-amber-500/30 transition-all active:scale-95"
          >
            <div className="flex items-center text-amber-300 font-bold text-[10px] uppercase tracking-[0.3em]">
              <Wrench className="w-4 h-4 mr-3 opacity-80" /> 
              Доход
            </div>
            <div className="text-[9px] text-amber-400 font-bold mt-1 tabular-nums">
              +{formatNumber(passiveIncome)}/с
            </div>
          </motion.button>
        )}

        {/* Repair button - показывается только когда нужно чинить */}
        {needsRepair && !showBuildings && !showRaid && passiveIncome === 0 && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onRepairAll}
            className="flex flex-col items-center px-10 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/30 transition-all"
          >
            <div className="flex items-center text-emerald-300 font-bold text-[10px] uppercase tracking-[0.3em]">
              <Wrench className="w-4 h-4 mr-3 opacity-80" /> 
              Ремонт
            </div>
            <div className="text-[9px] text-emerald-400 font-bold mt-1 tabular-nums">
              💰{formatNumber(repairCost)}
            </div>
          </motion.button>
        )}

        {/* Raid button */}
        <button
          onClick={onToggleRaid}
          className={`p-4 rounded-2xl transition-all duration-500 border ${
            showRaid
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-white/5 text-stone-400 hover:text-stone-200 border-white/5'
          }`}
        >
          <Skull className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};