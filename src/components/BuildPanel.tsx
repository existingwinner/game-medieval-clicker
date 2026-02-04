import { useState } from 'react';
import { Buff } from '../types/game';
import { BuildingType } from '../types/game';
import { BUILDING_TYPES } from '../data/buildings';

interface BuildPanelProps {
  buffs: Buff[];
  onSelectBuilding: (id: string | null) => void;
  selectedBuilding: string | null;
  onBuyBuff: (id: string) => void;
  canBuild: (id: string) => boolean;
  canBuyBuff: (id: string) => boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  showToggleButton?: boolean;
}

export function BuildPanel({ 
  buffs, 
  onSelectBuilding, 
  selectedBuilding,
  onBuyBuff,
  canBuild,
  canBuyBuff,
  isOpen,
  onToggle,
  showToggleButton = true
}: BuildPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onToggle ?? setInternalOpen;
  const [activeTab, setActiveTab] = useState<'buildings' | 'buffs'>('buildings');

  const formatCost = (type: BuildingType) => {
    const parts: string[] = [];
    if (type.cost.gold) parts.push(`${type.cost.gold}💰`);
    if (type.cost.wood) parts.push(`${type.cost.wood}🪵`);
    if (type.cost.stone) parts.push(`${type.cost.stone}🪨`);
    return parts.join(' ');
  };

  return (
    <>
      {/* Кнопка открытия */}
      {showToggleButton && (
        <button
          onClick={() => setOpen(!open)}
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 border-2 border-[#294566] 
                     px-2 py-5 rounded-r-lg text-[#f8d877] font-bold transition-colors
                     ${open ? 'bg-[#2a2d3c]' : 'panel-button-pulse'}`}
        >
          {open ? '◀' : '🏗️'}
        </button>
      )}

      {/* Панель */}
      <div
        id="build-panel"
        className={`
        fixed left-0 top-0 h-full w-[70vw] max-w-64 bg-[#191520] border-r-2 border-[#294566] z-40
        transform transition-transform duration-300 overflow-hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Заголовок */}
          <div className="p-3 bg-[#2a2d3c] border-b-2 border-[#294566]">
            <h2 className="text-[#f8d877] font-bold text-center">🏗️ Постройки</h2>
          </div>

          {/* Табы */}
          <div className="flex border-b-2 border-[#294566]">
            <button
              onClick={() => setActiveTab('buildings')}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${
                activeTab === 'buildings' 
                  ? 'bg-[#294566] text-[#f8d877]' 
                  : 'bg-[#2a2d3c] text-[#85c4d7]'
              }`}
            >
              🏠 Здания
            </button>
            <button
              onClick={() => setActiveTab('buffs')}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${
                activeTab === 'buffs' 
                  ? 'bg-[#294566] text-[#f8d877]' 
                  : 'bg-[#2a2d3c] text-[#85c4d7]'
              }`}
            >
              ✨ Баффы
            </button>
          </div>

          {/* Контент */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeTab === 'buildings' ? (
              BUILDING_TYPES.map(type => {
                const affordable = canBuild(type.id);
                const isSelected = selectedBuilding === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => onSelectBuilding(isSelected ? null : type.id)}
                    disabled={!affordable}
                    className={`
                      w-full p-2 rounded border-2 text-left transition-all
                      ${isSelected 
                        ? 'bg-[#4b7c52] border-[#a0b035]' 
                        : affordable 
                          ? 'bg-[#2a2d3c] border-[#294566] hover:border-[#85c4d7]' 
                          : 'bg-[#191520] border-[#2a2d3c] opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{type.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#f0efdf] font-bold text-base truncate">{type.name}</div>
                        <div className="text-[#85c4d7] text-sm truncate">{type.description}</div>
                        <div className="text-[#ffa057] text-sm">{formatCost(type)}</div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              buffs.map(buff => {
                const affordable = canBuyBuff(buff.id);
                
                return (
                  <button
                    key={buff.id}
                    onClick={() => onBuyBuff(buff.id)}
                    disabled={buff.purchased || !affordable}
                    className={`
                      w-full p-2 rounded border-2 text-left transition-all
                      ${buff.purchased 
                        ? 'bg-[#4b7c52] border-[#a0b035]' 
                        : affordable 
                          ? 'bg-[#2a2d3c] border-[#294566] hover:border-[#9653a2]' 
                          : 'bg-[#191520] border-[#2a2d3c] opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{buff.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#f0efdf] font-bold text-base truncate">
                          {buff.name} {buff.purchased && '✓'}
                        </div>
                        <div className="text-[#85c4d7] text-sm">{buff.description}</div>
                        <div className="text-[#9653a2] text-sm">{buff.cost}✨</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Подсказка */}
          {activeTab === 'buildings' && selectedBuilding && (
            <div className="p-2 bg-[#294566] border-t-2 border-[#2c6cba]">
              <p className="text-[#f0efdf] text-xs text-center">
                Нажмите на пустую ячейку для постройки
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
