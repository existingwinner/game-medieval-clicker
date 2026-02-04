import { useEffect, useRef, useState } from 'react';
import { Building, Resources } from '../types/game';
import { getBuildingType } from '../data/buildings';
import { playRepairSound, playClickSound } from '../utils/sounds';

interface BuildingModalProps {
  building: Building | null;
  resources: Resources;
  upgradeCost: { gold: number; wood: number; stone: number };
  canUpgrade: boolean;
  onClose: () => void;
  onRepair: (x: number, y: number) => void;
  onDemolish: (x: number, y: number) => void;
  onUpgrade: (x: number, y: number) => void;
}

function DotaHpBar({ current, max }: { current: number; max: number }) {
  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (current / safeMax) * 100));
  const [delayedPct, setDelayedPct] = useState(pct);
  const lastPctRef = useRef(pct);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = lastPctRef.current;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pct >= prev) {
      setDelayedPct(pct);
    } else {
      timerRef.current = window.setTimeout(() => {
        setDelayedPct(pct);
        timerRef.current = null;
      }, 220);
    }
    lastPctRef.current = pct;
  }, [pct]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const barColor = pct > 50 ? '#4b7c52' : pct > 25 ? '#f8d877' : '#e93f59';

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#f0efdf]">Прочность</span>
        <span className={current < safeMax ? 'text-[#e93f59]' : 'text-[#4b7c52]'}>
          {Math.floor(current)}/{Math.floor(safeMax)}
        </span>
      </div>
      <div className="h-3 bg-[#191520] border border-[#294566] rounded-[1px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2a2d3c]" />
        <div
          className="absolute h-full transition-[width] duration-500 ease-out"
          style={{ width: `${delayedPct}%`, backgroundColor: '#f0efdf', opacity: 0.28 }}
        />
        <div
          className="absolute h-full transition-[width] duration-160 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

export function BuildingModal({ 
  building, 
  resources, 
  upgradeCost,
  canUpgrade,
  onClose, 
  onRepair, 
  onDemolish,
  onUpgrade 
}: BuildingModalProps) {
  if (!building) return null;

  const type = getBuildingType(building.typeId);
  if (!type) return null;

  const isDamaged = building.hp < building.maxHp;
  const hpToRepair = building.maxHp - building.hp;
  const repairCostMultiplier = hpToRepair / 10;
  
  const woodCost = Math.ceil((type.repairCost.wood || 0) * repairCostMultiplier);
  const stoneCost = Math.ceil((type.repairCost.stone || 0) * repairCostMultiplier);
  
  const canRepair = isDamaged && 
    resources.wood >= woodCost && 
    resources.stone >= stoneCost;

  const isCastle = building.typeId === 'castle';
  const isMaxLevel = building.level >= 5;
  const levelBonus = (building.level - 1) * 20; // % бонус к производству

  const handleRepair = () => {
    playRepairSound();
    onRepair(building.x, building.y);
  };

  const handleUpgrade = () => {
    onUpgrade(building.x, building.y);
  };

  const handleDemolish = () => {
    playClickSound();
    onDemolish(building.x, building.y);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#2a2d3c] border-4 border-[#294566] rounded-lg p-4 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <span className="text-4xl">{type.emoji}</span>
            <span className="absolute -bottom-1 -right-1 bg-[#2c6cba] text-white text-xs font-bold px-1.5 rounded">
              Ур.{building.level}
            </span>
          </div>
          <div>
            <h3 className="text-[#f8d877] font-bold text-lg">{type.name}</h3>
            <p className="text-[#85c4d7] text-xs">{type.description}</p>
            {levelBonus > 0 && (
              <p className="text-[#a0b035] text-xs">+{levelBonus}% эффективность</p>
            )}
          </div>
        </div>

        {/* HP бар (Dota-стиль: серая полоса догоняет) */}
        <DotaHpBar current={building.hp} max={building.maxHp} />

        {/* Производство */}
        {(type.production.gold || type.production.wood || type.production.stone) && (
          <div className="mb-4 p-2 bg-[#191520] rounded border border-[#294566]">
            <div className="text-[#85c4d7] text-xs mb-1">Производит (×{1 + levelBonus / 100}):</div>
            <div className="flex gap-2 text-sm">
              {type.production.gold && (
                <span className="text-[#f8d877]">
                  +{Math.floor(type.production.gold * (1 + levelBonus / 100))}💰
                </span>
              )}
              {type.production.wood && (
                <span className="text-[#c68c76]">
                  +{Math.floor(type.production.wood * (1 + levelBonus / 100))}🪵
                </span>
              )}
              {type.production.stone && (
                <span className="text-[#85c4d7]">
                  +{Math.floor(type.production.stone * (1 + levelBonus / 100))}🪨
                </span>
              )}
            </div>
            <div className="text-[#294566] text-xs mt-1">
              каждые {type.productionInterval / 1000} сек
            </div>
          </div>
        )}

        {/* Ремонт */}
        {type.repairRate > 0 && (
          <div className="mb-4 p-2 bg-[#191520] rounded border border-[#294566]">
            <div className="text-[#4b7c52] text-sm">
              🔧 Ремонт: +{(type.repairRate * (1 + levelBonus / 100)).toFixed(1)} HP/сек
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex flex-col gap-2">
          {/* Улучшение */}
          {!isMaxLevel && (
            <button
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              className={`w-full py-2 px-3 rounded font-bold text-sm transition-colors ${
                canUpgrade 
                  ? 'bg-[#2c6cba] text-white hover:bg-[#85c4d7]' 
                  : 'bg-[#294566] text-[#85c4d7] opacity-50'
              }`}
            >
              ⬆️ Улучшить до Ур.{building.level + 1}
              <div className="text-xs opacity-75">
                {upgradeCost.gold}💰 {upgradeCost.wood > 0 && `${upgradeCost.wood}🪵`} {upgradeCost.stone > 0 && `${upgradeCost.stone}🪨`}
              </div>
            </button>
          )}
          {isMaxLevel && (
            <div className="w-full py-2 px-3 rounded font-bold text-sm bg-[#4b7c52] text-white text-center">
              ⭐ Максимальный уровень
            </div>
          )}

          <div className="flex gap-2">
            {isDamaged && (
              <button
                onClick={handleRepair}
                disabled={!canRepair}
                className={`flex-1 py-2 px-3 rounded font-bold text-sm transition-colors ${
                  canRepair 
                    ? 'bg-[#4b7c52] text-white hover:bg-[#a0b035]' 
                    : 'bg-[#294566] text-[#85c4d7] opacity-50'
                }`}
              >
                🔧 Починить
                <div className="text-xs opacity-75">
                  {woodCost}🪵 {stoneCost}🪨
                </div>
              </button>
            )}
            
            {!isCastle && (
              <button
                onClick={handleDemolish}
                className="flex-1 py-2 px-3 rounded font-bold text-sm bg-[#723738] text-white hover:bg-[#e93f59] transition-colors"
              >
                💥 Снести
              </button>
            )}
            
            <button
              onClick={onClose}
              className="py-2 px-4 rounded font-bold text-sm bg-[#294566] text-[#f0efdf] hover:bg-[#2c6cba] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
