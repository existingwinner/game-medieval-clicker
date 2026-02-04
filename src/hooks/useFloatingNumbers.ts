import { useState, useCallback, RefObject } from 'react';
import { FloatingNumber } from '../types';

export const useFloatingNumbers = (
  castleRef: RefObject<HTMLButtonElement | null>,
  buildingRefs: RefObject<{[key: string]: HTMLDivElement | null}>,
  gameOver: boolean
) => {
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  // Обновленная функция, которая принимает необязательные координаты
  const showFloatingNumber = useCallback((value: number, type = 'click', startX?: number, startY?: number) => {
    if (gameOver) return;
    
    let x: number, y: number;
    
    // Если переданы координаты, используем их
    if (startX !== undefined && startY !== undefined) {
      x = startX;
      y = startY;
    } else {
      // Иначе используем координаты замка
      if (!castleRef.current) return;
      const r = castleRef.current.getBoundingClientRect();
      if (r.width === 0) return;
      x = r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.3;
      y = r.top + r.height / 2 + (Math.random() - 0.5) * r.height * 0.25;
    }
    
    const id = Date.now() + Math.random();
    const newNumber: FloatingNumber = {
      id,
      value,
      x,
      y,
      color: type === 'income' ? 'text-emerald-400' : 'text-amber-400',
      fromCastle: true
    };
    
    setFloatingNumbers(prev => [...prev, newNumber]);
    setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 2800);
  }, [castleRef, gameOver]);

  const showFloatingNumberFromBuilding = useCallback((value: number, buildingId: string, index: number) => {
    if (!castleRef.current || gameOver) return;
    const cR = castleRef.current.getBoundingClientRect();
    const bE = buildingRefs.current?.[buildingId];
    if (!bE || cR.width === 0) return;
    
    const bR = bE.getBoundingClientRect();
    const id = Date.now() + Math.random() + index;
    
    const newNumber: FloatingNumber = {
      id,
      value,
      startX: bR.right + 10,
      startY: bR.top + bR.height / 2,
      endX: cR.left + cR.width / 2,
      endY: cR.top + cR.height / 2,
      color: 'text-emerald-400',
      fromBuilding: true
    };
    
    setFloatingNumbers(prev => [...prev, newNumber]);
    setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 2500);
  }, [castleRef, buildingRefs, gameOver]);

  const clearFloatingNumbers = useCallback(() => {
    setFloatingNumbers([]);
  }, []);

  return {
    floatingNumbers,
    showFloatingNumber,
    showFloatingNumberFromBuilding,
    clearFloatingNumbers
  };
};