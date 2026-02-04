// Основные типы для игры

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  determination: number;
}

export interface BuildingType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: Partial<Resources>;
  maxHp: number;
  production: Partial<Resources>;
  productionInterval: number; // в миллисекундах
  repairRate: number; // HP в секунду
  repairCost: Partial<Resources>; // стоимость ремонта за единицу HP
}

export interface Building {
  id: string;
  typeId: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  lastProduction: number;
  level: number; // уровень здания (1-5)
}

export interface Buff {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number; // в решимости
  effect: BuffEffect;
  purchased: boolean;
}

export interface BuffEffect {
  type: 'damage_reduction' | 'gold_boost' | 'repair_boost' | 'steal_reduction' | 'production_boost';
  value: number;
}

// Отдельный одичалый с индивидуальным таймером атаки
export interface Savage {
  id: number;
  nextAttackTime: number; // время следующей атаки (Date.now())
  attackCount: number; // сколько раз атаковал
}

export interface RaidState {
  isActive: boolean;
  wave: number;
  enemyCount: number;
  timeToNextRaid: number; // в секундах
  totalTimeToNextRaid: number; // общее время до набега
  raidTimeLeft: number; // время до конца рейда (в секундах)
  raidDuration: number; // общая длительность рейда
  enemiesRemaining: number; // для отображения (не используется в новой логике)
  savages: Savage[]; // массив одичалых с индивидуальными таймерами
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface FloatingNumber {
  id: string;
  value: number;
  emoji: string;
  resourceType: keyof Resources;
  // Экранные координаты старта
  startX: number;
  startY: number;
  // Тип полёта: 'up' - просто вверх (клик), 'toResource' - к ресурсу в хедере, 'down' - вниз (кража)
  mode: 'up' | 'toResource' | 'down';
  // Отрицательное число (для отображения кражи)
  isNegative?: boolean;
}

export interface GameState {
  resources: Resources;
  buildings: Building[];
  buffs: Buff[];
  raid: RaidState;
  clickMultiplier: number;

  /** Внутриигровое время (секунды с начала игры). Используется как “глобальный секундный тик”. */
  gameTime: number;

  gameStarted: boolean;
  gameWon: boolean;
  gameLost: boolean;
  lastUpdate: number;
}

// Сетка 9x5 (9 рядов, 5 колонок)
export const GRID_ROWS = 9;
export const GRID_COLS = 5;
export const CENTER_ROW = 4; // центральный ряд
export const CENTER_COL = 2; // центральная колонка
export const MAX_WAVES = 99;
