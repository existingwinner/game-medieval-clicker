import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';

interface FloatingIncomeProps {
  id: string;
  value: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete: (id: string) => void;
}

export const FloatingIncome = ({ 
  id, 
  value, 
  startX, 
  startY, 
  endX, 
  endY, 
  onComplete 
}: FloatingIncomeProps) => {
  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      initial={{ 
        x: startX, 
        y: startY, 
        opacity: 1, 
        scale: 0.8 
      }}
      animate={{ 
        x: endX, 
        y: endY, 
        opacity: 0,
        scale: 0.3
      }}
      transition={{ 
        duration: 1.5, 
        ease: "easeOut" 
      }}
      onAnimationComplete={() => onComplete(id)}
    >
      <div className="flex items-center bg-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-500/30">
        <Coins className="w-3 h-3 text-amber-300 mr-1.5" />
        <span className="text-xs font-bold text-amber-100 tabular-nums">
          +{formatNumber(value)}
        </span>
      </div>
    </motion.div>
  );
};