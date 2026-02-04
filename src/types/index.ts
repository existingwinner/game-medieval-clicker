import { LucideIcon } from 'lucide-react';

export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseIncome: number;
  count: number;
  color: string;
  icon: LucideIcon;
  maxHP: number;
  currentHP: number;
}

export interface Raid {
  progress: number;
  active: boolean;
  goblins: number;
  nextGoblins: number;
  wave: number;
  prepTime: number;
  duration: number;
  notification: boolean;
  endNotification: boolean;
  lastAttackTime: number;
}

export interface GameState {
  points: number;
  castleHP: number;
  maxCastleHP: number;
  buildings: Building[];
  raid: Raid;
  gameOver: boolean;
}

export interface FloatingNumber {
  id: number;
  value: number;
  x?: number;
  y?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  fromBuilding?: boolean;
  fromCastle?: boolean;
}
