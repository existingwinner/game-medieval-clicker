import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Shield } from 'lucide-react';

interface RaidNotificationProps {
  showStart: boolean;
  showEnd: boolean;
  goblins: number;
  wave: number;
}

export const RaidNotification = ({ showStart, showEnd, goblins, wave }: RaidNotificationProps) => {
  return (
    <AnimatePresence>
      {showStart && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
        >
          <div className="bg-[#1a0505]/95 border border-rose-900/50 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl">
            <Skull className="w-16 h-16 mx-auto mb-4 text-rose-300" />
            <div className="text-3xl font-bold text-rose-100 tracking-[0.2em] uppercase">
              Набег орды!
            </div>
            <div className="text-rose-400/80 mt-2 text-sm uppercase tracking-widest">
              {goblins} гоблинов у ворот
            </div>
          </div>
        </motion.div>
      )}

      {showEnd && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
        >
          <div className="bg-[#051a05]/95 border border-emerald-900/50 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl">
            <Shield className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
            <div className="text-3xl font-bold text-emerald-100 tracking-[0.2em] uppercase">
              Победа!
            </div>
            <div className="text-emerald-400/80 mt-2 text-sm uppercase tracking-widest">
              Отражено {wave} волн
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
