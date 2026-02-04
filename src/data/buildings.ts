import type { BuildingType } from '../types/game';

export const MAIN_BUILDING: BuildingType = {
  id: 'castle',
  name: 'Замок',
  emoji: '🏰',
  description: 'Ваш замок. Кликайте для золота!',
  cost: {},
  maxHp: 100,
  production: {},
  productionInterval: 0,
  repairRate: 0,
  repairCost: {}
};

export const BUILDING_TYPES: BuildingType[] = [
  {
    id: 'farm',
    name: 'Ферма',
    emoji: '🌾',
    description: '+0.5 золота/сек',
    cost: { gold: 50 },
    maxHp: 30,
    production: { gold: 0.5 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 1 }
  },
  {
    id: 'market',
    name: 'Рынок',
    emoji: '🏪',
    description: '+0.6 золота/сек',
    cost: { gold: 150 },
    maxHp: 40,
    production: { gold: 0.6 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 2 }
  },
  {
    id: 'bank',
    name: 'Банк',
    emoji: '🏦',
    description: '+1.6 золота/сек',
    cost: { gold: 500 },
    maxHp: 50,
    production: { gold: 1.6 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 3, stone: 1 }
  },
  {
    id: 'sawmill',
    name: 'Лесопилка',
    emoji: '🪓',
    description: '+0.25 дерева/сек',
    cost: { gold: 75 },
    maxHp: 35,
    production: { wood: 0.25 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 1 }
  },
  {
    id: 'lumber',
    name: 'Лесозавод',
    emoji: '🪵',
    description: '+0.75 дерева/сек',
    cost: { gold: 250 },
    maxHp: 45,
    production: { wood: 0.75 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 2 }
  },
  {
    id: 'quarry',
    name: 'Каменоломня',
    emoji: '⛏️',
    description: '+0.16 камня/сек',
    cost: { gold: 100 },
    maxHp: 50,
    production: { stone: 0.16 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { stone: 1 }
  },
  {
    id: 'mine',
    name: 'Шахта',
    emoji: '🏔️',
    description: '+0.5 камня/сек',
    cost: { gold: 350 },
    maxHp: 60,
    production: { stone: 0.5 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { stone: 2 }
  },
  {
    id: 'workshop',
    name: 'Мастерская',
    emoji: '🔧',
    description: 'Чинит: 1 HP/сек',
    cost: { gold: 200, wood: 20 },
    maxHp: 40,
    production: {},
    productionInterval: 0,
    repairRate: 1,
    repairCost: { wood: 1 }
  },
  {
    id: 'forge',
    name: 'Кузница',
    emoji: '⚒️',
    description: 'Чинит: 2 HP/сек',
    cost: { gold: 450, wood: 30, stone: 20 },
    maxHp: 55,
    production: {},
    productionInterval: 0,
    repairRate: 2,
    repairCost: { wood: 2, stone: 1 }
  },
  {
    id: 'temple',
    name: 'Храм',
    emoji: '⛪',
    description: 'Решимость после набегов',
    cost: { gold: 300, stone: 30 },
    maxHp: 70,
    production: {},
    productionInterval: 0,
    repairRate: 0.5,
    repairCost: { stone: 2 }
  },
  {
    id: 'tower',
    name: 'Башня',
    emoji: '🗼',
    description: '-5% урона набегов',
    cost: { gold: 400, stone: 40 },
    maxHp: 80,
    production: {},
    productionInterval: 0,
    repairRate: 0,
    repairCost: { stone: 3 }
  },
  {
    id: 'wall',
    name: 'Стена',
    emoji: '🧱',
    description: 'Прочная защита (HP: 120)',
    cost: { gold: 150, stone: 25 },
    maxHp: 120,
    production: {},
    productionInterval: 0,
    repairRate: 0,
    repairCost: { stone: 2 }
  },
  {
    id: 'tavern',
    name: 'Таверна',
    emoji: '🍺',
    description: '+1 золота/сек',
    cost: { gold: 280, wood: 25 },
    maxHp: 35,
    production: { gold: 1 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 2 }
  },
  {
    id: 'manor',
    name: 'Поместье',
    emoji: '🏠',
    description: '+0.25 всего/сек',
    cost: { gold: 600, wood: 40, stone: 30 },
    maxHp: 60,
    production: { gold: 0.25, wood: 0.25, stone: 0.25 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 2, stone: 2 }
  },
  {
    id: 'guild',
    name: 'Гильдия',
    emoji: '🏛️',
    description: '+2.4 золота/сек',
    cost: { gold: 800, stone: 50 },
    maxHp: 65,
    production: { gold: 2.4 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 3, stone: 2 }
  },
  {
    id: 'granary',
    name: 'Амбар',
    emoji: '🏚️',
    description: '+0.4 золота, +0.2 дерева/сек',
    cost: { gold: 180, wood: 15 },
    maxHp: 40,
    production: { gold: 0.4, wood: 0.2 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 1 }
  },
  {
    id: 'fortress',
    name: 'Крепость',
    emoji: '🏯',
    description: 'Чинит: 3 HP/сек',
    cost: { gold: 700, wood: 50, stone: 60 },
    maxHp: 100,
    production: {},
    productionInterval: 0,
    repairRate: 3,
    repairCost: { wood: 3, stone: 2 }
  },
  {
    id: 'treasury',
    name: 'Казна',
    emoji: '💰',
    description: '+4 золота/сек',
    cost: { gold: 1500, stone: 80 },
    maxHp: 50,
    production: { gold: 4 },
    productionInterval: 1000,
    repairRate: 0,
    repairCost: { wood: 4, stone: 3 }
  }
];

export function getBuildingType(id: string): BuildingType | undefined {
  if (id === 'castle') return MAIN_BUILDING;
  return BUILDING_TYPES.find(b => b.id === id);
}
