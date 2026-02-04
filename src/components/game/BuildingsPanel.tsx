import { Hammer, X } from 'lucide-react';
import { Building } from '../../types';
import { formatNumber, calculateBuildingCost } from '../../utils/helpers';
import { HealthBar } from '../ui/HealthBar';

interface BuildingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  points: number;
  gameOver: boolean;
  onBuyBuilding: (id: string, quantity: number) => void;
  buildingRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

export const BuildingsPanel = ({
  isOpen,
  onClose,
  buildings,
  points,
  gameOver,
  onBuyBuilding,
  buildingRefs
}: BuildingsPanelProps) => {
  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-[#0a0a0a]/95 border-r border-white/5 backdrop-blur-2xl transform transition-transform duration-500 ease-out z-30 w-full sm:w-80 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-sm font-bold text-amber-200/60 uppercase tracking-[0.3em] flex items-center gap-3">
          <Hammer className="w-4 h-4" /> Архитектура
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-all text-stone-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[calc(100%-5rem)] overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {buildings.map((b) => (
          <div
            key={b.id}
            ref={(el) => { buildingRefs.current[b.id] = el; }}
            className="p-4 rounded-2xl border border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center shadow-2xl ring-1 ring-white/10`}
              >
                <b.icon className="w-6 h-6 text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-stone-100 text-sm tracking-wide">
                  {b.name}
                </div>
                <div className="text-[10px] text-stone-500 mt-1 uppercase tracking-tighter italic">
                  {b.description}
                </div>
              </div>
            </div>

            {b.count > 0 && (
              <>
                <div className="mb-4 text-[9px] uppercase tracking-widest text-stone-600 font-bold flex justify-between">
                  <span>Статус</span>
                  <span>{Math.ceil(b.currentHP)} HP</span>
                </div>
                <div className="mb-4">
                  <HealthBar current={b.currentHP} max={b.count * b.maxHP} />
                </div>
              </>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map((qty) => {
                const cost = calculateBuildingCost(b, qty);
                const canAfford = points >= cost;
                return (
                  <button
                    key={qty}
                    onClick={() => onBuyBuilding(b.id, qty)}
                    disabled={!canAfford || gameOver}
                    className={`py-2.5 rounded-xl font-bold text-[10px] transition-all border ${
                      canAfford
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-200/70 hover:bg-amber-500/10'
                        : 'bg-stone-900/20 border-white/[0.02] text-stone-700 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="opacity-40 text-[8px] uppercase block mb-0.5">
                      x{qty}
                    </span>
                    <span className="text-xs">💰{formatNumber(cost)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
