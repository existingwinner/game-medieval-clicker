import { useRef, useCallback } from 'react';
import type { Building, BuildingType, GridPosition } from '../types/game';
import { HPBar } from './HPBar';

interface BuildingCellProps {
  position: GridPosition;
  building?: Building;
  buildingType?: BuildingType;
  isSelected: boolean;
  onClick: () => void;
  onLongPress?: () => void;
}

export function BuildingCell({ 
  position,
  building,
  buildingType,
  isSelected,
  onClick,
  onLongPress
}: BuildingCellProps) {
  const isEmpty = !building;
  const canPlace = isEmpty && isSelected;
  const longPressTimer = useRef<number | null>(null);

  const handleTouchStart = useCallback(() => {
    if (onLongPress && building) {
      longPressTimer.current = window.setTimeout(() => {
        onLongPress();
      }, 500);
    }
  }, [onLongPress, building]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      data-building-pos={`${position.row}-${position.col}`}
      className={`
        w-full aspect-square relative flex items-center justify-center cursor-pointer transition-all duration-150 rounded-full
        ${canPlace ? 'bg-[#4b7c52]/30 animate-pulse border-2 border-[#a0b035]' : ''}
        ${building && building.hp <= 0 ? 'opacity-40 grayscale' : ''}
        active:scale-90 outline-none
      `}
    >
      {building && buildingType && (
        <div className="relative w-full h-full flex items-center justify-center scale-110">
          <span className="text-2xl sm:text-3xl select-none pointer-events-none drop-shadow-sm">
            {buildingType.emoji}
          </span>
          <HPBar current={building.hp} max={building.maxHp} showAlways={false} />
        </div>
      )}
      
      {canPlace && (
        <span className="text-[#a0b035] text-xl font-bold">✓</span>
      )}
    </button>
  );
}
