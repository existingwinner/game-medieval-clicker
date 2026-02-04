import { FC, useMemo } from 'react';
import { GameState, GridPosition, Building, GRID_ROWS, GRID_COLS, CENTER_ROW, CENTER_COL } from '../types/game';
import { BuildingCell } from './BuildingCell';
import { getBuildingType, MAIN_BUILDING } from '../data/buildings';

interface GameGridProps {
  gameState: GameState;
  selectedBuilding: string | null;
  onCellClick: (position: GridPosition) => void;
  onBuildingLongPress: (building: Building) => void;
  onCastleClick?: (x: number, y: number) => void;
}

export const GameGrid: FC<GameGridProps> = ({
  gameState,
  selectedBuilding,
  onCellClick,
  onBuildingLongPress,
  onCastleClick
}) => {
  const cells = useMemo(() => {
    const result: GridPosition[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        result.push({ row, col });
      }
    }
    return result;
  }, []);

  return (
    <div className="relative w-full flex-1 flex items-center justify-center p-1 min-h-0">
      <div 
        className="relative select-none"
        style={{
          width: 'min(92vw, 360px)',
          height: 'min(70vh, 580px)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          gap: '8px',
          aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`
        }}
      >
        {cells.map((pos) => {
          const isCenter = pos.row === CENTER_ROW && pos.col === CENTER_COL;
          const building = gameState.buildings.find(
            b => b.x === pos.col && b.y === pos.row && b.typeId !== 'castle'
          );
          const buildingType = building ? getBuildingType(building.typeId) : undefined;

          return (
            <div
              key={`${pos.row}-${pos.col}`}
              className="relative flex items-center justify-center"
              style={{
                gridRow: pos.row + 1,
                gridColumn: pos.col + 1,
              }}
            >
              {/* Слой 1: Фоновая ячейка сетки (визуальная плитка) */}
              <div className="absolute inset-0 bg-[#2a2d3c]/20 border border-[#294566]/20 rounded-full pointer-events-none aspect-square w-full" />

              {/* Слой 2: Контент (Здание или Замок) */}
              <div className="relative w-full h-full flex items-center justify-center z-10">
                {isCenter ? (
                  <button
                    data-building-pos={`${CENTER_ROW}-${CENTER_COL}`}
                    className="absolute w-[150%] h-[150%] aspect-square flex items-center justify-center transition-all duration-100 active:scale-90 origin-center cursor-pointer select-none touch-none z-30 outline-none group castle-button"
                    onClick={(e) => onCastleClick?.(e.clientX, e.clientY)}
                  >
                    {/* Свечение при наведении/активности */}
                    <div className="absolute inset-0 bg-[#f8d877]/0 group-hover:bg-[#f8d877]/20 group-active:bg-[#f8d877]/40 blur-lg rounded-full transition-all duration-200 pointer-events-none" />
                    {/* Основной контейнер замка - нейтральный фон, подсветка при клике */}
                    <div className="relative w-full h-full bg-[#2a2d3c] group-active:bg-[#3a3d4c] rounded-full border-[3px] border-[#294566] group-hover:border-[#f8d877]/50 group-active:border-[#f8d877] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-all duration-150">
                      <span className="text-[clamp(1.8rem,10vmin,3rem)] drop-shadow-md select-none group-active:scale-110 transition-transform">
                        {MAIN_BUILDING.emoji}
                      </span>
                      {/* Shine effect on click */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f8d877]/0 to-[#f8d877]/0 group-active:from-[#f8d877]/30 group-active:to-transparent transition-all duration-150 rounded-full" />
                    </div>
                  </button>
                ) : (
                  <BuildingCell
                    position={pos}
                    building={building}
                    buildingType={buildingType}
                    isSelected={selectedBuilding !== null}
                    onClick={() => onCellClick(pos)}
                    onLongPress={building ? () => onBuildingLongPress(building) : undefined}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
