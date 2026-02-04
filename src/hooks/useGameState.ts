import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '../types';
import { INITIAL_BUILDINGS, INITIAL_RAID, INITIAL_GAME_STATE } from '../constants/buildings';
import { calculateBuildingCost, calculateMaxCastleHP } from '../utils/helpers';

export const useGameState = (playDamageSound: () => void) => {
  const [game, setGame] = useState<GameState>(INITIAL_GAME_STATE);
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Load saved game
  useEffect(() => {
    const saved = localStorage.getItem('medieval-clicker-save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.points === 'number') {
          const buildings = parsed.buildings || INITIAL_BUILDINGS.map(b => ({...b, count: 0, currentHP: 0}));
          const totalBuildingsCount = buildings.reduce((sum: number, b: any) => sum + (b.count || 0), 0);
          setGame(prev => ({
            ...prev,
            ...parsed,
            maxCastleHP: 200 + totalBuildingsCount * 10,
            buildings: prev.buildings.map(b => {
              const s = (parsed.buildings || []).find((sb: any) => sb.id === b.id);
              return s ? { ...b, count: s.count || 0, currentHP: s.currentHP || (s.count * b.maxHP) } : b;
            })
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save game
  useEffect(() => {
    localStorage.setItem('medieval-clicker-save', JSON.stringify(game));
  }, [game]);

  // Clear notifications
  useEffect(() => {
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout;
    if (game.raid.notification) {
      t1 = setTimeout(() => setGame(prev => ({ ...prev, raid: { ...prev.raid, notification: false } })), 3000);
    }
    if (game.raid.endNotification) {
      t2 = setTimeout(() => setGame(prev => ({ ...prev, raid: { ...prev.raid, endNotification: false } })), 3000);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [game.raid.notification, game.raid.endNotification]);

  // Update max castle HP
  useEffect(() => {
    const calculatedMaxHP = calculateMaxCastleHP(game.buildings);
    if (calculatedMaxHP !== game.maxCastleHP) {
      setGame(prev => ({
        ...prev,
        maxCastleHP: calculatedMaxHP,
        castleHP: Math.min(prev.castleHP + (calculatedMaxHP - prev.maxCastleHP), calculatedMaxHP)
      }));
    }
  }, [game.buildings, game.maxCastleHP]);

  // Raid attack logic
  useEffect(() => {
    if (game.gameOver || !game.raid.active) return;
    
    const interval = setInterval(() => {
      setGame(prev => {
        if (prev.gameOver || !prev.raid.active) return prev;
        
        const now = Date.now();
        const diff = now - prev.raid.lastAttackTime;
        if (diff < 50) return prev;
        
        let cHP = prev.castleHP;
        const blds = [...prev.buildings];
        let dmg = false;
        
        for (let i = 0; i < prev.raid.goblins; i++) {
          if (Math.random() < 0.125) {
            const targets = blds.filter(b => b.count > 0 && b.currentHP > 0);
            if (targets.length > 0 && Math.random() > 0.35) {
              const target = targets[Math.floor(Math.random() * targets.length)];
              const idx = blds.findIndex(b => b.id === target.id);
              blds[idx].currentHP = Math.max(0, blds[idx].currentHP - 1);
              if (blds[idx].currentHP === 0) {
                blds[idx].count = 0;
                blds[idx].currentHP = 0;
              }
              dmg = true;
            } else {
              cHP = Math.max(0, cHP - 1);
              dmg = true;
            }
          }
        }
        
        if (dmg) playDamageSound();
        
        if (cHP <= 0) {
          return {
            ...prev,
            castleHP: 0,
            gameOver: true,
            raid: { ...prev.raid, active: false, duration: 0, lastAttackTime: now }
          };
        }
        
        const nDur = Math.max(0, prev.raid.duration - (diff / 1000));
        const raid = { ...prev.raid, duration: nDur, lastAttackTime: now };
        
        if (nDur <= 0) {
          raid.active = false;
          raid.wave += 1;
          raid.endNotification = true;
          raid.nextGoblins = Math.ceil(raid.goblins * 1.4);
          raid.prepTime = Math.min(150, 30 * Math.pow(1.25, raid.wave));
          raid.progress = 0;
        }
        
        return { ...prev, castleHP: cHP, buildings: blds, raid };
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [game.gameOver, game.raid.active, playDamageSound]);

  // Raid progress logic
  useEffect(() => {
    if (game.gameOver || game.raid.active) return;
    
    const interval = setInterval(() => {
      setGame(prev => {
        if (prev.gameOver || prev.raid.active) return prev;
        
        const r = { ...prev.raid };
        if (r.progress < 100) {
          r.progress = Math.min(100, r.progress + (100 / r.prepTime));
          if (r.progress >= 100) {
            r.active = true;
            r.goblins = r.nextGoblins;
            r.duration = 15;
            r.progress = 0;
            r.notification = true;
            r.lastAttackTime = Date.now();
          }
        }
        return { ...prev, raid: r };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [game.gameOver, game.raid.active]);

  // Actions
  const addPoints = useCallback((amount: number) => {
    setGame(prev => ({ ...prev, points: prev.points + amount }));
  }, []);

  const buyBuilding = useCallback((id: string, quantity: number) => {
    setGame(prev => {
      const idx = prev.buildings.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      
      const b = prev.buildings[idx];
      const cost = calculateBuildingCost(b, quantity);
      if (prev.points < cost) return prev;
      
      const blds = [...prev.buildings];
      blds[idx] = {
        ...b,
        count: b.count + quantity,
        currentHP: b.currentHP + (b.maxHP * quantity)
      };
      
      return { ...prev, points: prev.points - cost, buildings: blds };
    });
  }, []);

  const repairAll = useCallback(() => {
    setGame(prev => {
      let cost = Math.ceil((prev.maxCastleHP - prev.castleHP) * 0.45);
      const blds = prev.buildings.map(b => {
        if (b.count > 0 && b.currentHP < b.count * b.maxHP) {
          cost += Math.ceil((b.count * b.maxHP - b.currentHP) * 0.35);
          return { ...b, currentHP: b.count * b.maxHP };
        }
        return b;
      });
      
      if (prev.points < cost) return prev;
      return { ...prev, points: prev.points - cost, castleHP: prev.maxCastleHP, buildings: blds };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGame({
      points: 0,
      castleHP: 200,
      maxCastleHP: 200,
      buildings: INITIAL_BUILDINGS.map(b => ({ ...b, count: 0, currentHP: 0 })),
      raid: INITIAL_RAID,
      gameOver: false
    });
    localStorage.removeItem('medieval-clicker-save');
  }, []);

  return {
    game,
    gameRef,
    addPoints,
    buyBuilding,
    repairAll,
    resetGame
  };
};
