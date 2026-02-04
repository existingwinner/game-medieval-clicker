import { Buff } from '../types/game';

export const BUFFS: Buff[] = [
  {
    id: 'knight1',
    name: 'Рыцарь',
    emoji: '⚔️',
    description: '-10% урона',
    cost: 10,
    effect: { type: 'damage_reduction', value: 0.1 },
    purchased: false
  },
  {
    id: 'knight2',
    name: 'Паладин',
    emoji: '🛡️',
    description: '-15% урона',
    cost: 25,
    effect: { type: 'damage_reduction', value: 0.15 },
    purchased: false
  },
  {
    id: 'knight3',
    name: 'Чемпион',
    emoji: '🦸',
    description: '-20% урона',
    cost: 50,
    effect: { type: 'damage_reduction', value: 0.2 },
    purchased: false
  },
  {
    id: 'cleric1',
    name: 'Клирик',
    emoji: '✨',
    description: '+25% ремонта',
    cost: 15,
    effect: { type: 'repair_boost', value: 0.25 },
    purchased: false
  },
  {
    id: 'cleric2',
    name: 'Жрец',
    emoji: '🙏',
    description: '+50% ремонта',
    cost: 35,
    effect: { type: 'repair_boost', value: 0.5 },
    purchased: false
  },
  {
    id: 'merchant1',
    name: 'Торговец',
    emoji: '🪙',
    description: '+20% золота',
    cost: 20,
    effect: { type: 'gold_boost', value: 0.2 },
    purchased: false
  },
  {
    id: 'merchant2',
    name: 'Магнат',
    emoji: '👑',
    description: '+40% золота',
    cost: 45,
    effect: { type: 'gold_boost', value: 0.4 },
    purchased: false
  },
  {
    id: 'guard1',
    name: 'Стража',
    emoji: '💂',
    description: '-25% кражи',
    cost: 15,
    effect: { type: 'steal_reduction', value: 0.25 },
    purchased: false
  },
  {
    id: 'guard2',
    name: 'Гвардия',
    emoji: '🏇',
    description: '-50% кражи',
    cost: 40,
    effect: { type: 'steal_reduction', value: 0.5 },
    purchased: false
  },
  {
    id: 'worker1',
    name: 'Ремесленник',
    emoji: '👷',
    description: '+15% ресурсов',
    cost: 20,
    effect: { type: 'production_boost', value: 0.15 },
    purchased: false
  },
  {
    id: 'worker2',
    name: 'Мастер',
    emoji: '🧙',
    description: '+30% ресурсов',
    cost: 55,
    effect: { type: 'production_boost', value: 0.3 },
    purchased: false
  },
  {
    id: 'hero',
    name: 'Герой',
    emoji: '🦅',
    description: '-30% урона',
    cost: 100,
    effect: { type: 'damage_reduction', value: 0.3 },
    purchased: false
  }
];
