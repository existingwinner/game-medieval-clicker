import { useEffect, RefObject } from 'react';
import { GameState } from '../types';
import { calculateTotalIncome } from '../utils/helpers';

export const useAutoIncome = (
  game: GameState,
  gameRef: RefObject<GameState | null>,
  buildingRefs: RefObject<{[key: string]: HTMLDivElement | null}>,
  addPoints: (amount: number) => void,
  showFloatingNumberFromBuilding: (value: number, buildingId: string, index: number) => void
) => {
  const totalIncome = calculateTotalIncome(game.buildings);

  useEffect(() => {
    if (totalIncome <= 0 || game.gameOver) return;

    const interval = setInterval(() => {
      const currentGame = gameRef.current;
      if (!currentGame || currentGame.gameOver) return;

      const inc = calculateTotalIncome(currentGame.buildings);
      addPoints(inc);

      // Show floating numbers for each building
      currentGame.buildings.forEach((b, i) => {
        if (b.count > 0 && b.baseIncome > 0 && buildingRefs.current?.[b.id]) {
          showFloatingNumberFromBuilding(b.baseIncome * b.count, b.id, i);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalIncome, game.gameOver, gameRef, buildingRefs, addPoints, showFloatingNumberFromBuilding]);

  return totalIncome;
};
