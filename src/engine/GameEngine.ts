import {
  GameState,
  Building,
  Resources,
  FloatingNumber,
  Savage,
  MAX_WAVES,
  CENTER_ROW,
  CENTER_COL,
} from '../types/game';
import { BUILDING_TYPES, getBuildingType, MAIN_BUILDING } from '../data/buildings';
import { BUFFS } from '../data/buffs';
import {
  playRaidStartSound,
  playRaidEndSound,
  playDamageSound,
  playStealSound,
} from '../utils/sounds';

const SAVE_KEY = 'kingdom_clicker_save';
const SAVE_INTERVAL = 5000;

export class GameEngine {
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private onFloatingNumber: (fn: FloatingNumber) => void;
  private onRaidEvent: (message: string) => void;
  private lastTick: number = 0;
  private tickInterval: number | null = null;
  private saveInterval: number | null = null;

  // Аккумулятор реального времени для “глобального секундного тика”
  private secondAccumulatorMs: number = 0; // Время следующей атаки одичалого

  constructor(
    onStateChange: (state: GameState) => void,
    onFloatingNumber: (fn: FloatingNumber) => void,
    onRaidEvent: (message: string) => void
  ) {
    this.onStateChange = onStateChange;
    this.onFloatingNumber = onFloatingNumber;
    this.onRaidEvent = onRaidEvent;
    this.state = this.loadState() || this.createInitialState();
    
    this.processOfflineProgress();
  }

  // Формула времени до следующего рейда (сбалансированная)
  private calculateTimeToNextRaid(wave: number): number {
    // Начинаем с 60 сек, растём логарифмически
    // Wave 1: 60s, Wave 5: 90s, Wave 10: 105s, Wave 20: 120s, Wave 50: 140s
    const baseTime = 60;
    const timeGrowth = Math.log2(wave + 1) * 15;
    return Math.floor(baseTime + timeGrowth);
  }

  // Формула длительности рейда (зависит от кол-ва врагов)
  private calculateRaidDuration(enemyCount: number): number {
    // Каждый враг атакует раз в 0.8-1.5 сек, нужно время на всех
    // Средний интервал = 1.15 сек, добавляем 3 сек запаса
    return Math.ceil(enemyCount * 1.15) + 3;
  }

  private loadState(): GameState | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;

        // Миграции сохранений
        if ((parsed as any).gameTime === undefined) {
          (parsed as any).gameTime = 0;
        }

        if (parsed.buffs.length < BUFFS.length) {
          const existingIds = new Set(parsed.buffs.map(b => b.id));
          BUFFS.forEach(buff => {
            if (!existingIds.has(buff.id)) {
              parsed.buffs.push({ ...buff });
            }
          });
        }
        if (parsed.raid.raidTimeLeft === undefined) {
          parsed.raid.raidTimeLeft = 0;
          parsed.raid.raidDuration = 10;
          parsed.raid.enemiesRemaining = 0;
        }
        if (parsed.raid.savages === undefined) {
          parsed.raid.savages = [];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return null;
  }

  private saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  private processOfflineProgress() {
    if (!this.state.gameStarted) return;
    
    const now = Date.now();
    const offlineTime = (now - this.state.lastUpdate) / 1000;
    
    if (offlineTime < 1) return;
    
    const maxOfflineTime = 24 * 60 * 60;
    const effectiveTime = Math.min(offlineTime, maxOfflineTime);
    
    const offlineEfficiency = 0.7;
    const goldBoost = this.getTotalGoldBoost();
    const productionBoost = this.getTotalProductionBoost();
    
    let offlineGold = 0;
    let offlineWood = 0;
    let offlineStone = 0;
    
    for (const building of this.state.buildings) {
      if (building.hp <= 0) continue;
      
      const type = getBuildingType(building.typeId);
      if (!type || type.productionInterval === 0) continue;
      
      const cyclesPerSecond = 1000 / type.productionInterval;
      const totalCycles = effectiveTime * cyclesPerSecond * offlineEfficiency;
      
      if (type.production.gold) {
        offlineGold += type.production.gold * (1 + goldBoost + productionBoost) * totalCycles;
      }
      if (type.production.wood) {
        offlineWood += type.production.wood * (1 + productionBoost) * totalCycles;
      }
      if (type.production.stone) {
        offlineStone += type.production.stone * (1 + productionBoost) * totalCycles;
      }
    }
    
    this.state.resources.gold += Math.floor(offlineGold);
    this.state.resources.wood += Math.floor(offlineWood);
    this.state.resources.stone += Math.floor(offlineStone);
    
    // Сдвигаем внутриигровое время (ограничим, чтобы не улетало на годы)
    this.state.gameTime += Math.floor(effectiveTime);

    this.state.lastUpdate = now;
    
    if (offlineGold > 0 || offlineWood > 0 || offlineStone > 0) {
      const mins = Math.floor(effectiveTime / 60);
      this.onRaidEvent(`💤 Офлайн ${mins} мин: +${Math.floor(offlineGold)}💰 +${Math.floor(offlineWood)}🪵 +${Math.floor(offlineStone)}🪨`);
    }
  }

  private createInitialState(): GameState {
    const mainBuilding: Building = {
      id: 'main',
      typeId: 'castle',
      hp: MAIN_BUILDING.maxHp,
      maxHp: MAIN_BUILDING.maxHp,
      x: CENTER_COL,
      y: CENTER_ROW,
      lastProduction: Date.now(),
      level: 1
    };

    return {
      resources: { gold: 25, wood: 10, stone: 5, determination: 0 },
      buildings: [mainBuilding],
      buffs: BUFFS.map(b => ({ ...b })),
      raid: {
        isActive: false,
        wave: 0,
        enemyCount: 0,
        timeToNextRaid: 60,
        totalTimeToNextRaid: 60,
        raidTimeLeft: 0,
        raidDuration: 10,
        enemiesRemaining: 0,
        savages: []
      },
      clickMultiplier: 1,

      gameTime: 0,

      gameStarted: false,
      gameWon: false,
      gameLost: false,
      lastUpdate: Date.now()
    };
  }

  start() {
    this.state.gameStarted = true;
    this.lastTick = Date.now();
    this.secondAccumulatorMs = 0;

    // Внутренний “сердцебиение” чаще секунды для точности набегов,
    // но вся экономика/таймеры обновляются строго по “секундному тику”.
    this.tickInterval = window.setInterval(() => this.tick(), 100);

    this.saveInterval = window.setInterval(() => this.saveState(), SAVE_INTERVAL);
    this.notifyStateChange();
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    this.saveState();
  }

  private tick() {
    const now = Date.now();
    const dtMs = now - this.lastTick;
    this.lastTick = now;

    if (this.state.gameWon || this.state.gameLost) return;

    let shouldNotify = false;

    // 1) Точная обработка рейда по реальному времени (не привязана к секундам)
    const deltaSec = dtMs / 1000;
    if (this.state.raid.isActive) {
      const raidChanged = this.processActiveRaid(deltaSec, now);
      if (raidChanged) shouldNotify = true;
    }

    // 2) “Глобальный секундный тик” для экономики и таймеров
    this.secondAccumulatorMs += dtMs;
    let secondsToProcess = Math.floor(this.secondAccumulatorMs / 1000);
    if (secondsToProcess > 0) {
      this.secondAccumulatorMs -= secondsToProcess * 1000;

      // защитимся от подвисаний вкладки (макс 10 секунд за раз)
      secondsToProcess = Math.min(secondsToProcess, 10);

      for (let i = 0; i < secondsToProcess; i++) {
        this.state.gameTime += 1;

        if (!this.state.raid.isActive) {
          this.updateRaidTimer(1);
        }

        this.processProductionSecondTick();
        this.processRepairSecondTick(1);

        // Game over: если все здания разрушены
        if (this.state.buildings.every(b => b.hp <= 0)) {
          this.state.gameLost = true;
          this.onRaidEvent('💀 Поражение! Все здания разрушены!');
          break;
        }
      }

      shouldNotify = true;
    }

    this.state.lastUpdate = now;
    if (shouldNotify) {
      this.notifyStateChange();
    }
  }

  private updateRaidTimer(delta: number) {
    this.state.raid.timeToNextRaid -= delta;

    if (this.state.raid.timeToNextRaid <= 0) {
      this.startRaid();
    }
  }

  private startRaid() {
    const wave = this.state.raid.wave + 1;
    
    if (wave > MAX_WAVES) {
      this.state.gameWon = true;
      this.onRaidEvent('🎉 ПОБЕДА! Вы отбили все 99 волн!');
      return;
    }

    // Экспоненциальный рост врагов (более агрессивный)
    // Wave 1: ~3, Wave 5: ~7, Wave 10: ~15, Wave 20: ~50, Wave 50: ~500
    const enemyCount = Math.floor(3 * Math.pow(1.18 + Math.random() * 0.07, wave));
    const raidDuration = this.calculateRaidDuration(enemyCount);
    
    // Создаём массив одичалых с индивидуальными таймерами
    const now = Date.now();
    const savages: Savage[] = [];
    for (let i = 0; i < enemyCount; i++) {
      savages.push({
        id: i,
        nextAttackTime: now + this.getRandomAttackInterval(), // каждый начнёт атаковать в случайный момент
        attackCount: 0
      });
    }
    
    this.state.raid.isActive = true;
    this.state.raid.wave = wave;
    this.state.raid.enemyCount = enemyCount;
    this.state.raid.enemiesRemaining = enemyCount;
    this.state.raid.raidTimeLeft = raidDuration;
    this.state.raid.raidDuration = raidDuration;
    this.state.raid.savages = savages;
    
    playRaidStartSound();
    this.onRaidEvent(`⚔️ Волна ${wave}! ${enemyCount} одичалых атакуют!`);
  }

  // Рандомный интервал между атаками: 0.8 - 1.5 секунды
  private getRandomAttackInterval(): number {
    return 800 + Math.random() * 700; // 800-1500 мс
  }

  /**
   * Все одичалые атакуют параллельно, каждый со своим таймером.
   * @returns true если изменилось что-то, что нужно отрисовать
   */
  private processActiveRaid(delta: number, now: number): boolean {
    this.state.raid.raidTimeLeft -= delta;

    // Проверяем конец рейда по времени
    if (this.state.raid.raidTimeLeft <= 0) {
      this.endRaid();
      return true;
    }

    let changed = true; // таймер тикает — UI должен обновляться

    // Проверяем каждого одичалого - готов ли он атаковать
    for (const savage of this.state.raid.savages) {
      if (now >= savage.nextAttackTime) {
        // Этот одичалый атакует!
        this.processSingleSavageAttack(savage);
        // Устанавливаем время следующей атаки для этого одичалого
        savage.nextAttackTime = now + this.getRandomAttackInterval();
        savage.attackCount++;
        changed = true;
      }
    }

    return changed;
  }

  /**
   * Атака одного одичалого (вызывается для каждого savage когда его таймер срабатывает)
   */
  private processSingleSavageAttack(_savage: Savage) {
    const damageReduction = this.getTotalDamageReduction();
    const stealReduction = this.getTotalStealReduction();

    const aliveBuildings = this.state.buildings.filter(b => b.hp > 0);
    if (aliveBuildings.length === 0) {
      this.state.gameLost = true;
      this.onRaidEvent('💀 Поражение! Все здания разрушены!');
      return;
    }

    // Наносим урон случайному зданию
    const target = aliveBuildings[Math.floor(Math.random() * aliveBuildings.length)];
    const baseDamage = 0.5 + Math.random() * 0.5; // 0.5-1.0 урона
    const damage = baseDamage * (1 - damageReduction);
    target.hp = Math.max(0, target.hp - damage);
    
    playDamageSound();

    // Кража золота (каждый одичалый ворует немного)
    const stealAmount = Math.floor(5 * (1 - stealReduction)); // 5 золота за атаку
    if (this.state.resources.gold >= stealAmount && stealAmount > 0) {
      this.state.resources.gold -= stealAmount;
      this.emitNegativeFloatingNumber(stealAmount);
      playStealSound();
    }

    // Проверка на уничтожение всех зданий
    if (this.state.buildings.every(b => b.hp <= 0)) {
      this.state.gameLost = true;
      this.onRaidEvent('💀 Поражение! Все здания разрушены!');
    }
  }

  private emitNegativeFloatingNumber(amount: number) {
    const goldEl = document.getElementById('resource-gold');
    let startX = window.innerWidth / 2;
    let startY = 50;
    
    if (goldEl) {
      const rect = goldEl.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.bottom;
    }

    const fn: FloatingNumber = {
      id: `steal-${Date.now()}-${Math.random()}`,
      value: amount,
      emoji: '💸',
      resourceType: 'gold',
      startX,
      startY,
      mode: 'down',
      isNegative: true
    };
    this.onFloatingNumber(fn);
  }

  private endRaid() {
    const enemiesDefeated = this.state.raid.enemyCount - this.state.raid.enemiesRemaining;
    
    // Награда - Решимость (храмы)
    const temples = this.state.buildings.filter(b => b.typeId === 'temple' && b.hp > 0);
    if (temples.length > 0) {
      const determination = enemiesDefeated * temples.length;
      this.state.resources.determination += determination;
      this.onRaidEvent(`✨ Храмы дали ${determination} Решимости`);
    }

    this.state.raid.isActive = false;
    this.state.raid.enemiesRemaining = 0;
    this.state.raid.raidTimeLeft = 0;
    
    // Следующий набег (сбалансированная формула)
    const nextWaveTime = this.calculateTimeToNextRaid(this.state.raid.wave + 1);
    this.state.raid.timeToNextRaid = nextWaveTime;
    this.state.raid.totalTimeToNextRaid = nextWaveTime;

    playRaidEndSound();
    this.onRaidEvent(`🛡️ Волна ${this.state.raid.wave} отбита!`);
    this.notifyStateChange();
  }

  /** Производство строго 1 раз в секунду (стабильный “спам” доходов). */
  private processProductionSecondTick() {
    const goldBoost = this.getTotalGoldBoost();
    const productionBoost = this.getTotalProductionBoost();

    for (const building of this.state.buildings) {
      if (building.hp <= 0) continue;

      const type = getBuildingType(building.typeId);
      if (!type) continue;

      // Производство: считаем, что production в data/buildings уже “в секунду”
      if (type.production.gold) {
        const levelBonus = (building.level - 1) * 0.2;
        const amount = type.production.gold * (1 + goldBoost + productionBoost + levelBonus);
        this.state.resources.gold += amount;
        // показываем ровно то, что начислили (без clamp)
        const shown = Math.round(amount * 100) / 100;
        this.emitFloatingNumber(building, shown, '💰', 'gold');
      }
      if (type.production.wood) {
        const levelBonus = (building.level - 1) * 0.2;
        const amount = type.production.wood * (1 + productionBoost + levelBonus);
        this.state.resources.wood += amount;
        const shown = Math.round(amount * 100) / 100;
        this.emitFloatingNumber(building, shown, '🪵', 'wood');
      }
      if (type.production.stone) {
        const levelBonus = (building.level - 1) * 0.2;
        const amount = type.production.stone * (1 + productionBoost + levelBonus);
        this.state.resources.stone += amount;
        const shown = Math.round(amount * 100) / 100;
        this.emitFloatingNumber(building, shown, '🪨', 'stone');
      }
    }
  }

  /** Ремонт строго по секундам: проще и предсказуемее, меньше лагов. */
  private processRepairSecondTick(deltaSec: number) {
    const repairBoost = this.getTotalRepairBoost();
    const repairBuildings = this.state.buildings.filter(
      b => b.hp > 0 && (getBuildingType(b.typeId)?.repairRate || 0) > 0
    );

    const baseTotalRepairRate = repairBuildings.reduce((sum, b) => {
      const type = getBuildingType(b.typeId);
      const levelBonus = (b.level - 1) * 0.2;
      return sum + (type?.repairRate || 0) * (1 + levelBonus);
    }, 0);

    const totalRepairRate = baseTotalRepairRate * (1 + repairBoost);
    if (totalRepairRate <= 0) return;

    const damagedBuildings = this.state.buildings.filter(b => b.hp > 0 && b.hp < b.maxHp);
    if (damagedBuildings.length === 0) return;

    const repairPerBuilding = (totalRepairRate / damagedBuildings.length) * deltaSec;

    // Материалы на ремонт (в секунду)
    const materialCostPerHp = 0.1;
    const totalHpToRepair = repairPerBuilding * damagedBuildings.length;
    const woodCost = totalHpToRepair * materialCostPerHp;

    if (woodCost <= 0) return;

    if (this.state.resources.wood < woodCost) {
      const ratio = this.state.resources.wood / woodCost;
      if (ratio <= 0) return;

      for (const building of damagedBuildings) {
        const actualRepair = repairPerBuilding * ratio;
        building.hp = Math.min(building.maxHp, building.hp + actualRepair);
      }
      this.state.resources.wood = 0;
    } else {
      for (const building of damagedBuildings) {
        building.hp = Math.min(building.maxHp, building.hp + repairPerBuilding);
      }
      this.state.resources.wood -= woodCost;
    }
  }

  private getTotalDamageReduction(): number {
    let reduction = this.state.buffs
      .filter(b => b.purchased && b.effect.type === 'damage_reduction')
      .reduce((sum, b) => sum + b.effect.value, 0);
    
    const towers = this.state.buildings.filter(b => b.typeId === 'tower' && b.hp > 0).length;
    reduction += towers * 0.05;
    
    return Math.min(0.9, reduction);
  }

  private getTotalStealReduction(): number {
    return Math.min(0.9, this.state.buffs
      .filter(b => b.purchased && b.effect.type === 'steal_reduction')
      .reduce((sum, b) => sum + b.effect.value, 0));
  }

  private getTotalGoldBoost(): number {
    return this.state.buffs
      .filter(b => b.purchased && b.effect.type === 'gold_boost')
      .reduce((sum, b) => sum + b.effect.value, 0);
  }

  private getTotalRepairBoost(): number {
    return this.state.buffs
      .filter(b => b.purchased && b.effect.type === 'repair_boost')
      .reduce((sum, b) => sum + b.effect.value, 0);
  }

  private getTotalProductionBoost(): number {
    return this.state.buffs
      .filter(b => b.purchased && b.effect.type === 'production_boost')
      .reduce((sum, b) => sum + b.effect.value, 0);
  }

  private emitFloatingNumber(building: Building, value: number, emoji: string, resourceType: keyof Resources) {
    const cellEl = document.querySelector(`[data-building-pos="${building.y}-${building.x}"]`);
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 3;
    
    if (cellEl) {
      const rect = cellEl.getBoundingClientRect();
      // Центр по X, верх здания по Y (чтобы число вылетало сверху)
      startX = rect.left + rect.width / 2;
      startY = rect.top + 5; // немного ниже верхнего края
    }
    
    const fn: FloatingNumber = {
      id: `${Date.now()}-${Math.random()}`,
      value,
      emoji,
      resourceType,
      startX,
      startY,
      mode: 'toResource'
    };
    this.onFloatingNumber(fn);
  }

  clickCastle(): number {
    const castle = this.state.buildings.find(b => b.typeId === 'castle');
    if (!castle || castle.hp <= 0) return 0;

    const goldBoost = this.getTotalGoldBoost();
    const amount = Math.floor(this.state.clickMultiplier * (1 + goldBoost));
    this.state.resources.gold += amount;
    this.notifyStateChange();
    return amount;
  }

  canBuild(buildingTypeId: string): boolean {
    const type = BUILDING_TYPES.find(b => b.id === buildingTypeId);
    if (!type) return false;

    const { resources } = this.state;
    if (type.cost.gold && resources.gold < type.cost.gold) return false;
    if (type.cost.wood && resources.wood < type.cost.wood) return false;
    if (type.cost.stone && resources.stone < type.cost.stone) return false;

    return true;
  }

  placeBuilding(buildingTypeId: string, x: number, y: number): boolean {
    if (x === CENTER_COL && y === CENTER_ROW) return false;
    
    const existing = this.state.buildings.find(b => b.x === x && b.y === y);
    if (existing) return false;

    const type = BUILDING_TYPES.find(b => b.id === buildingTypeId);
    if (!type) return false;

    if (!this.canBuild(buildingTypeId)) return false;

    if (type.cost.gold) this.state.resources.gold -= type.cost.gold;
    if (type.cost.wood) this.state.resources.wood -= type.cost.wood;
    if (type.cost.stone) this.state.resources.stone -= type.cost.stone;

    const building: Building = {
      id: `${buildingTypeId}-${Date.now()}`,
      typeId: buildingTypeId,
      hp: type.maxHp,
      maxHp: type.maxHp,
      x,
      y,
      lastProduction: Date.now(),
      level: 1
    };

    this.state.buildings.push(building);
    this.notifyStateChange();
    return true;
  }

  removeBuilding(x: number, y: number): boolean {
    const index = this.state.buildings.findIndex(b => b.x === x && b.y === y && b.typeId !== 'castle');
    if (index === -1) return false;

    this.state.buildings.splice(index, 1);
    this.notifyStateChange();
    return true;
  }

  canBuyBuff(buffId: string): boolean {
    const buff = this.state.buffs.find(b => b.id === buffId);
    if (!buff || buff.purchased) return false;
    return this.state.resources.determination >= buff.cost;
  }

  buyBuff(buffId: string): boolean {
    const buff = this.state.buffs.find(b => b.id === buffId);
    if (!buff || buff.purchased) return false;
    if (this.state.resources.determination < buff.cost) return false;

    this.state.resources.determination -= buff.cost;
    buff.purchased = true;
    this.notifyStateChange();
    return true;
  }

  manualRepair(x: number, y: number): boolean {
    const building = this.state.buildings.find(b => b.x === x && b.y === y);
    if (!building || building.hp >= building.maxHp) return false;

    const type = getBuildingType(building.typeId);
    if (!type) return false;

    const hpToRepair = building.maxHp - building.hp;
    const repairCostMultiplier = hpToRepair / 10;

    const woodCost = Math.ceil((type.repairCost.wood || 0) * repairCostMultiplier);
    const stoneCost = Math.ceil((type.repairCost.stone || 0) * repairCostMultiplier);

    if (this.state.resources.wood < woodCost || this.state.resources.stone < stoneCost) {
      return false;
    }

    this.state.resources.wood -= woodCost;
    this.state.resources.stone -= stoneCost;
    building.hp = building.maxHp;
    this.notifyStateChange();
    return true;
  }

  getState(): GameState {
    return this.state;
  }

  getTowers(): number {
    return this.state.buildings.filter(b => b.typeId === 'tower' && b.hp > 0).length;
  }

  private notifyStateChange() {
    this.onStateChange({ ...this.state });
  }

  resetGame() {
    localStorage.removeItem(SAVE_KEY);
    this.state = this.createInitialState();
    this.notifyStateChange();
  }

  getUpgradeCost(building: Building): { gold: number; wood: number; stone: number } {
    const type = getBuildingType(building.typeId);
    if (!type) return { gold: 0, wood: 0, stone: 0 };
    
    const level = building.level;
    const multiplier = Math.pow(2, level);
    
    return {
      gold: Math.floor((type.cost.gold || 50) * multiplier),
      wood: Math.floor((type.cost.wood || 0) * multiplier * 0.5),
      stone: Math.floor((type.cost.stone || 0) * multiplier * 0.5)
    };
  }

  canUpgrade(x: number, y: number): boolean {
    const building = this.state.buildings.find(b => b.x === x && b.y === y);
    if (!building || building.level >= 5) return false;
    
    const cost = this.getUpgradeCost(building);
    return (
      this.state.resources.gold >= cost.gold &&
      this.state.resources.wood >= cost.wood &&
      this.state.resources.stone >= cost.stone
    );
  }

  upgradeBuilding(x: number, y: number): boolean {
    const building = this.state.buildings.find(b => b.x === x && b.y === y);
    if (!building || building.level >= 5) return false;
    
    const cost = this.getUpgradeCost(building);
    
    if (!this.canUpgrade(x, y)) return false;

    this.state.resources.gold -= cost.gold;
    this.state.resources.wood -= cost.wood;
    this.state.resources.stone -= cost.stone;

    building.level++;
    const hpBonus = building.maxHp * 0.2;
    building.maxHp += hpBonus;
    building.hp = building.maxHp;
    
    this.notifyStateChange();
    return true;
  }

  getRepairAllCost(): { wood: number; stone: number; count: number } {
    let totalWood = 0;
    let totalStone = 0;
    let count = 0;

    for (const building of this.state.buildings) {
      if (building.hp < building.maxHp && building.hp > 0) {
        const type = getBuildingType(building.typeId);
        if (!type) continue;

        const hpToRepair = building.maxHp - building.hp;
        const repairCostMultiplier = hpToRepair / 10;

        totalWood += Math.ceil((type.repairCost.wood || 0) * repairCostMultiplier);
        totalStone += Math.ceil((type.repairCost.stone || 0) * repairCostMultiplier);
        count++;
      }
    }

    return { wood: totalWood, stone: totalStone, count };
  }

  canRepairAll(): boolean {
    const cost = this.getRepairAllCost();
    return (
      cost.count > 0 &&
      this.state.resources.wood >= cost.wood &&
      this.state.resources.stone >= cost.stone
    );
  }

  repairAll(): boolean {
    if (!this.canRepairAll()) return false;

    const cost = this.getRepairAllCost();
    
    this.state.resources.wood -= cost.wood;
    this.state.resources.stone -= cost.stone;

    for (const building of this.state.buildings) {
      if (building.hp < building.maxHp && building.hp > 0) {
        building.hp = building.maxHp;
      }
    }

    this.notifyStateChange();
    return true;
  }
}
