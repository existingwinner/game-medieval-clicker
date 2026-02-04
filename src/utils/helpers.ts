import { Building, GameState } from '../types';

export const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(num < 1 ? 1 : 0);
};

export const calculateBuildingCost = (building: Building, quantity: number): number => {
  let cost = 0;
  for (let i = 0; i < quantity; i++) {
    cost += building.baseCost * Math.pow(1.15, building.count + i);
  }
  return cost;
};

export const calculateTotalIncome = (buildings: Building[]): number => {
  return buildings.reduce((sum, b) => sum + b.baseIncome * b.count, 0);
};

export const calculateTotalBuildings = (buildings: Building[]): number => {
  return buildings.reduce((sum, b) => sum + b.count, 0);
};

export const calculateMaxCastleHP = (buildings: Building[]): number => {
  return 200 + calculateTotalBuildings(buildings) * 10;
};

export const getTotalRepairCost = (game: GameState): number => {
  let cost = Math.ceil((game.maxCastleHP - game.castleHP) * 0.45);
  game.buildings.forEach(b => {
    if (b.count > 0 && b.currentHP < b.count * b.maxHP) {
      cost += Math.ceil((b.count * b.maxHP - b.currentHP) * 0.35);
    }
  });
  return cost;
};

export const needsRepair = (game: GameState): boolean => {
  return game.castleHP < game.maxCastleHP || 
         game.buildings.some(b => b.count > 0 && b.currentHP < b.count * b.maxHP);
};
