import { Wheat, Hammer, Church, Pickaxe, Scroll, Gem } from 'lucide-react';
import { Building } from '../types';

export const INITIAL_BUILDINGS: Omit<Building, 'currentHP'>[] = [
  { 
    id: 'wheat-field', 
    name: 'Пшеничное поле', 
    description: 'Выращивает зерно для казны', 
    baseCost: 20, 
    baseIncome: 0.3, 
    count: 0, 
    color: 'bg-amber-800/80', 
    icon: Wheat, 
    maxHP: 25 
  },
  { 
    id: 'blacksmith', 
    name: 'Кузница', 
    description: 'Кует монеты в горне', 
    baseCost: 100, 
    baseIncome: 1.5, 
    count: 0, 
    color: 'bg-slate-700/80', 
    icon: Hammer, 
    maxHP: 45 
  },
  { 
    id: 'temple', 
    name: 'Храм', 
    description: 'Молится за защиту королевства', 
    baseCost: 250, 
    baseIncome: 4, 
    count: 0, 
    color: 'bg-indigo-900/80', 
    icon: Church, 
    maxHP: 70 
  },
  { 
    id: 'quarry', 
    name: 'Каменоломня', 
    description: 'Добывает камень для строительства', 
    baseCost: 1000, 
    baseIncome: 12, 
    count: 0, 
    color: 'bg-zinc-800/80', 
    icon: Pickaxe, 
    maxHP: 95 
  },
  { 
    id: 'workshop', 
    name: 'Ремесленная гильдия', 
    description: 'Производит товары для торговли', 
    baseCost: 4000, 
    baseIncome: 50, 
    count: 0, 
    color: 'bg-emerald-900/80', 
    icon: Scroll, 
    maxHP: 140 
  },
  { 
    id: 'treasury', 
    name: 'Сокровищница', 
    description: 'Хранит и приумножает богатства', 
    baseCost: 20000, 
    baseIncome: 250, 
    count: 0, 
    color: 'bg-amber-600/80', 
    icon: Gem, 
    maxHP: 230 
  }
];

export const INITIAL_RAID = {
  progress: 0,
  active: false,
  goblins: 0,
  nextGoblins: 2,
  wave: 0,
  prepTime: 30,
  duration: 0,
  notification: false,
  endNotification: false,
  lastAttackTime: 0
};

export const INITIAL_GAME_STATE = {
  points: 0,
  castleHP: 200,
  maxCastleHP: 200,
  buildings: INITIAL_BUILDINGS.map(b => ({ ...b, currentHP: 0 })),
  raid: INITIAL_RAID,
  gameOver: false
};
