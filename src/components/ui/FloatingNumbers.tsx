import { motion, AnimatePresence } from 'framer-motion';
import { FloatingNumber } from '../../types';
import { formatNumber } from '../../utils/helpers';

interface FloatingNumbersProps {
  numbers: FloatingNumber[];
}

export const FloatingNumbers = ({ numbers }: FloatingNumbersProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {numbers.map((n) => (
          n.fromBuilding ? (
            <motion.div
              key={n.id}
              className={`absolute font-bold text-lg ${n.color}`}
              style={{
                left: n.startX,
                top: n.startY,
                transform: 'translate(-50%, -50%)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                x: [(n.endX || 0) - (n.startX || 0)],
                y: [(n.endY || 0) - (n.startY || 0)],
                opacity: [1, 1, 0],
                scale: [1, 1, 0.3]
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              +{formatNumber(n.value)}
            </motion.div>
          ) : (
            <motion.div
              key={n.id}
              className={`absolute font-bold text-2xl ${n.color}`}
              style={{
                left: n.x,
                top: n.y,
                transform: 'translate(-50%, -50%)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ y: -80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              +{formatNumber(n.value)}
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
};
