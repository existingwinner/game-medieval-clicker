import { useEffect, useState, useCallback, useRef } from 'react';
import { GameState, Building, GridPosition, FloatingNumber } from './types/game';
import { GameEngine } from './engine/GameEngine';
import { ResourceBar } from './components/ResourceBar';
import { GameGrid } from './components/GameGrid';
import { BuildPanel } from './components/BuildPanel';
import { RaidPanel } from './components/RaidPanel';
import { FloatingNumbers } from './components/FloatingNumbers';
import { BuildingModal } from './components/BuildingModal';
import { StartScreen } from './components/StartScreen';
import { KingdomHPBar } from './components/KingdomHPBar';
import { playCoinSound, playBuildSound, playClickSound, playRepairSound, playUpgradeSound } from './utils/sounds';

const hasSavedGame = () => {
  try {
    const saved = localStorage.getItem('kingdom_clicker_save');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.gameStarted === true;
    }
  } catch (e) {
    console.error('Failed to check save:', e);
  }
  return false;
};

export function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [raidMessages, setRaidMessages] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [modalBuilding, setModalBuilding] = useState<Building | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(!hasSavedGame());
  const [buildPanelOpen, setBuildPanelOpen] = useState(false);
  const [raidPanelOpen, setRaidPanelOpen] = useState(false);
  const engineRef = useRef<GameEngine | null>(null);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  // Мгновенное добавление floating numbers без буферизации
  const handleFloatingNumber = useCallback((fn: FloatingNumber) => {
    setFloatingNumbers(prev => [...prev, fn]);
  }, []);

  const handleRaidEvent = useCallback((message: string) => {
    setRaidMessages(prev => [...prev.slice(-19), message]);
  }, []);

  useEffect(() => {
    if (showStartScreen) return;
    
    const engine = new GameEngine(handleStateChange, handleFloatingNumber, handleRaidEvent);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
    };
  }, [handleStateChange, handleFloatingNumber, handleRaidEvent, showStartScreen]);

  useEffect(() => {
    const handleOutsidePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const buildPanel = document.getElementById('build-panel');
      const raidPanel = document.getElementById('raid-panel');
      const clickedInsideBuild = buildPanel?.contains(target) ?? false;
      const clickedInsideRaid = raidPanel?.contains(target) ?? false;

      // Закрываем панели только если клик/тап вне них
      if (!clickedInsideBuild && !clickedInsideRaid) {
        setBuildPanelOpen(false);
        setRaidPanelOpen(false);
      }
    };

    // pointerdown с capture, чтобы не зависеть от onClick и порядка всплытия
    window.addEventListener('pointerdown', handleOutsidePointerDown, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointerDown, { capture: true } as any);
    };
  }, []);

  const handleStartGame = useCallback(() => {
    setShowStartScreen(false);
  }, []);

  const handleCastleClick = useCallback((e: React.MouseEvent) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    const amount = engineRef.current?.clickCastle();

    if (amount && amount > 0) {
      playCoinSound();

      const fn: FloatingNumber = {
        id: `click-${Date.now()}-${Math.random()}`,
        value: amount,
        emoji: '💰',
        resourceType: 'gold',
        startX: clickX,
        startY: clickY,
        mode: 'up',
      };
      handleFloatingNumber(fn);
    }
  }, [handleFloatingNumber]);

  const handleCellClick = useCallback((position: GridPosition) => {
    const { row, col } = position;
    
    if (row === 4 && col === 2) return;

    if (selectedBuilding) {
      const success = engineRef.current?.placeBuilding(selectedBuilding, col, row);
      if (success) {
        playBuildSound();
        setSelectedBuilding(null);
        setBuildPanelOpen(true);
      }
    } else {
      const building = gameState?.buildings.find(b => b.x === col && b.y === row);
      if (building) {
        playClickSound();
        setModalBuilding(building);
      }
    }
  }, [selectedBuilding, gameState?.buildings]);

  const handleBuildingLongPress = useCallback((building: Building) => {
    setModalBuilding(building);
  }, []);

  const handleSelectBuilding = useCallback((id: string | null) => {
    setSelectedBuilding(id);
    if (id) {
      setBuildPanelOpen(false);
      setRaidPanelOpen(false);
    }
  }, []);

  const handleBuyBuff = useCallback((id: string) => {
    engineRef.current?.buyBuff(id);
  }, []);

  const canBuild = useCallback((id: string) => {
    return engineRef.current?.canBuild(id) ?? false;
  }, []);

  const canBuyBuff = useCallback((id: string) => {
    return engineRef.current?.canBuyBuff(id) ?? false;
  }, []);

  const handleFloatingComplete = useCallback((id: string) => {
    setFloatingNumbers(prev => prev.filter(fn => fn.id !== id));
  }, []);

  const handleRepair = useCallback((x: number, y: number) => {
    engineRef.current?.manualRepair(x, y);
    setModalBuilding(null);
  }, []);

  const handleDemolish = useCallback((x: number, y: number) => {
    engineRef.current?.removeBuilding(x, y);
    setModalBuilding(null);
  }, []);

  const handleUpgrade = useCallback((x: number, y: number) => {
    const success = engineRef.current?.upgradeBuilding(x, y);
    if (success) {
      playUpgradeSound();
      const building = engineRef.current?.getState().buildings.find(b => b.x === x && b.y === y);
      if (building) {
        setModalBuilding({ ...building });
      }
    }
  }, []);

  const handleRepairAll = useCallback(() => {
    const success = engineRef.current?.repairAll();
    if (success) {
      playRepairSound();
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalBuilding(null);
  }, []);

  if (showStartScreen) {
    return <StartScreen onStart={handleStartGame} />;
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#191520] flex items-center justify-center">
        <div className="text-[#f8d877] text-2xl animate-pulse">⚔️ Загрузка...</div>
      </div>
    );
  }

  const handleRestart = () => {
    localStorage.removeItem('kingdom_clicker_save');
    window.location.reload();
  };

  if (gameState.gameWon) {
    return (
      <div className="min-h-screen bg-[#191520] flex items-center justify-center p-4">
        <div className="bg-[#2a2d3c] border-4 border-[#f8d877] rounded-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉👑🎉</div>
          <h1 className="text-[#f8d877] text-3xl font-bold mb-4">ПОБЕДА!</h1>
          <p className="text-[#f0efdf] mb-4 text-lg">
            Вы успешно отбили все 99 волн одичалых и защитили своё королевство!
          </p>
          <button
            onClick={handleRestart}
            className="bg-[#4b7c52] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a0b035] transition-colors text-lg"
          >
            🔄 Играть снова
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameLost) {
    return (
      <div className="min-h-screen bg-[#191520] flex items-center justify-center p-4">
        <div className="bg-[#2a2d3c] border-4 border-[#e93f59] rounded-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">💀⚔️💀</div>
          <h1 className="text-[#e93f59] text-3xl font-bold mb-4">ПОРАЖЕНИЕ</h1>
          <p className="text-[#f0efdf] mb-4 text-lg">
            Ваше королевство пало... Вы продержались {gameState.raid.wave} волн.
          </p>
          <button
            onClick={handleRestart}
            className="bg-[#723738] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e93f59] transition-colors text-lg"
          >
            🔄 Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] bg-[#191520] flex flex-col overflow-hidden transition-all ${gameState.raid.isActive ? 'animate-shake' : ''}`}>
      {/* Верхняя панель (фиксированная зона, не сжимается) */}
      <div className="shrink-0">
        <ResourceBar 
          resources={gameState.resources}
          wave={gameState.raid.wave}
          timeToRaid={gameState.raid.timeToNextRaid}
          isRaidActive={gameState.raid.isActive}
        />

        <KingdomHPBar 
          current={gameState.buildings.reduce((sum, b) => sum + Math.max(0, b.hp), 0)}
          max={gameState.buildings.reduce((sum, b) => sum + b.maxHp, 0)}
        />
      </div>

      {/* Основная область игры (сжимается при необходимости, но не налезает) */}
      <div
        className="flex-1 relative overflow-hidden min-h-0 flex flex-col items-center justify-center pt-3"
        data-grid
        onPointerDownCapture={(e) => {
          const target = e.target as Node | null;
          if (!target) return;

          const buildPanel = document.getElementById('build-panel');
          const raidPanel = document.getElementById('raid-panel');
          const clickedInsideBuild = buildPanel?.contains(target) ?? false;
          const clickedInsideRaid = raidPanel?.contains(target) ?? false;

          if (!clickedInsideBuild && !clickedInsideRaid) {
            setBuildPanelOpen(false);
            setRaidPanelOpen(false);
          }
        }}
      >
        <GameGrid
          gameState={gameState}
          selectedBuilding={selectedBuilding}
          onCellClick={handleCellClick}
          onBuildingLongPress={handleBuildingLongPress}
          onCastleClick={(x, y) => {
            handleCastleClick({ clientX: x, clientY: y } as React.MouseEvent);
          }}
        />

        {/* Плавающие числа */}
        <FloatingNumbers numbers={floatingNumbers} onComplete={handleFloatingComplete} />
      </div>

      {/* Боковые панели */}
      <BuildPanel
        buffs={gameState.buffs}
        onSelectBuilding={handleSelectBuilding}
        selectedBuilding={selectedBuilding}
        onBuyBuff={handleBuyBuff}
        canBuild={canBuild}
        canBuyBuff={canBuyBuff}
        isOpen={buildPanelOpen}
        onToggle={(open) => {
          setBuildPanelOpen(open);
          if (open) setRaidPanelOpen(false);
        }}
        showToggleButton={false}
      />

      <RaidPanel 
        raid={gameState.raid} 
        messages={raidMessages} 
        isOpen={raidPanelOpen}
        onToggle={(open) => {
          setRaidPanelOpen(open);
          if (open) setBuildPanelOpen(false);
        }}
        showToggleButton={false}
      />

      {/* Модальное окно здания */}
      {modalBuilding && (
        <BuildingModal
          building={modalBuilding}
          resources={gameState.resources}
          upgradeCost={engineRef.current?.getUpgradeCost(modalBuilding) || { gold: 0, wood: 0, stone: 0 }}
          canUpgrade={engineRef.current?.canUpgrade(modalBuilding.x, modalBuilding.y) || false}
          onClose={handleCloseModal}
          onRepair={handleRepair}
          onDemolish={handleDemolish}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Нижняя зона управления (не перекрывает поле) */}
      {(() => {
        const repairCost = engineRef.current?.getRepairAllCost() || { wood: 0, stone: 0, count: 0 };
        const canRepairAll = engineRef.current?.canRepairAll() || false;
        const anyDamaged = repairCost.count > 0;

        const circleBase =
          'w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold transition-all active:scale-95 select-none';

        return (
          <div className="shrink-0 w-full px-3 pb-3 pt-2">
            <div className="mx-auto max-w-md flex items-center justify-between gap-3">
              {/* Постройки */}
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setRaidPanelOpen(false);
                  setBuildPanelOpen(prev => !prev);
                }}
                className={`${circleBase} bg-[#2a2d3c]/80 border-[#294566] text-[#f0efdf] hover:border-[#85c4d7] hover:text-[#85c4d7]`}
                title="Постройки"
              >
                🏗️
              </button>

              {/* Починить всё */}
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRepairAll();
                }}
                disabled={!anyDamaged || !canRepairAll}
                className={`${circleBase} ${
                  anyDamaged
                    ? canRepairAll
                      ? 'bg-[#294566] border-[#4b7c52] text-[#f0efdf] shadow-[0_0_12px_rgba(75,124,82,0.25)]'
                      : 'bg-[#294566]/80 border-[#294566] text-[#f0efdf] opacity-70'
                    : 'bg-[#2a2d3c]/80 border-[#294566] text-[#85c4d7] opacity-70'
                }`}
                title={anyDamaged ? `Починить всё (${repairCost.count})` : 'Все здания целы'}
              >
                🔧
              </button>

              {/* Набеги */}
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setBuildPanelOpen(false);
                  setRaidPanelOpen(prev => !prev);
                }}
                className={`${circleBase} bg-[#2a2d3c]/80 border-[#294566] text-[#f0efdf] hover:border-[#e93f59] hover:text-[#e93f59]`}
                title="Набеги и журнал"
              >
                ⚔️
              </button>
            </div>

            {/* Небольшая подсказка при выборе здания — не перекрывает */}
            {selectedBuilding && (
              <div className="mt-2 mx-auto max-w-md">
                <div className="bg-[#2a2d3c] border border-[#294566] px-3 py-2 rounded text-center">
                  <p className="text-[#85c4d7] font-medium" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)' }}>
                    👆 Выберите ячейку для постройки
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
