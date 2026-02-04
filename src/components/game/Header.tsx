import { Coins, TrendingUp, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber } from '../../utils/helpers';
import { forwardRef } from 'react';

interface HeaderProps {
  points: number;
  totalIncome: number;
  onReset: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(({ 
  points, 
  totalIncome, 
  onReset 
}, ref) => {
  return (
    <header className="bg-stone-950/40 backdrop-blur-lg border-b border-white/5 py-3 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div 
          ref={ref}
          data-points-button
          className="flex items-center bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.05]"
        >
          <Coins className="w-5 h-5 text-amber-400 mr-3" />
          <motion.span 
            key={points}
            className="font-bold text-xl text-amber-50 tabular-nums"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(points)}
          </motion.span>
        </div>
        <div className="hidden xs:flex items-center bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
          <TrendingUp className="w-4 h-4 text-emerald-300 mr-2" />
          <span className="text-sm font-bold text-emerald-300">
            +{formatNumber(totalIncome)}/с
          </span>
        </div>
      </div>
      <button
        onClick={onReset}
        className="p-2.5 bg-white/5 hover:bg-rose-900/20 rounded-xl border border-white/5 transition-all text-stone-300 hover:text-rose-300"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    </header>
  );
});

Header.displayName = 'Header';