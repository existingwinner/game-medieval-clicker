import { useState, useRef, useCallback, useEffect } from 'react';
import { formatNumber, getTotalRepairCost, needsRepair } from './utils/helpers';
import { useAudio, useFloatingNumbers, useGameState, useAutoIncome } from './hooks';
import {
  Header,
  Castle,
  BuildingsPanel,
  RaidPanel,
  FloatingControls,
  FloatingNumbers,
  ResetDialog,
  RaidNotification,
  GameOverScreen
} from './components';

const App = () => {
  // Refs
  const castleRef = useRef<HTMLButtonElement>(null);
  const buildingRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Audio hooks
  const { initAudioContext, playClickSound, playDamageSound } = useAudio();

  // Game state hook
  const { game, gameRef, addPoints, buyBuilding, repairAll, resetGame } = useGameState(playDamageSound);

  // Floating numbers hook
  const { floatingNumbers, showFloatingNumber, showFloatingNumberFromBuilding, clearFloatingNumbers } = 
    useFloatingNumbers(castleRef, buildingRefs, game.gameOver);

  // Auto income hook
  const totalIncome = useAutoIncome(game, gameRef, buildingRefs, addPoints, showFloatingNumberFromBuilding);

  // UI State
  const [showBuildings, setShowBuildings] = useState(false);
  const [showRaid, setShowRaid] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Эффект для автоматического создания плавающих чисел от пассивного дохода
// В эффекте для автоматического создания плавающих чисел от пассивного дохода
useEffect(() => {
  if (totalIncome <= 0 || game.gameOver) return;

  const interval = setInterval(() => {
    // Создаем плавающее число из центра замка
    if (castleRef.current) {
      const rect = castleRef.current.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      
      // Используем обновленную функцию с координатами
      showFloatingNumber(totalIncome, 'income', startX, startY);
      
      // Также добавляем очки (пассивный доход)
      addPoints(totalIncome);
    }
  }, 1000); // Каждую секунду
  
  return () => clearInterval(interval);
}, [totalIncome, game.gameOver, addPoints, showFloatingNumber]);

  // Handlers
  const handleClick = useCallback(() => {
    if (game.gameOver) return;
    const now = Date.now();
    if (now - lastClickTime < 50) return;
    setLastClickTime(now);
    initAudioContext();
    playClickSound();
    addPoints(1);
    showFloatingNumber(1, 'click');
  }, [game.gameOver, lastClickTime, initAudioContext, playClickSound, addPoints, showFloatingNumber]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleBuyBuilding = useCallback((id: string, quantity: number) => {
    if (game.gameOver) return;
    initAudioContext();
    playClickSound();
    buyBuilding(id, quantity);
  }, [game.gameOver, initAudioContext, playClickSound, buyBuilding]);

  const handleToggleBuildings = useCallback(() => {
    setShowBuildings(!showBuildings);
    setShowRaid(false);
  }, [showBuildings]);

  const handleToggleRaid = useCallback(() => {
    setShowRaid(!showRaid);
    setShowBuildings(false);
  }, [showRaid]);

  const handleRepairAll = useCallback(() => {
    if (game.gameOver) return;
    repairAll();
  }, [game.gameOver, repairAll]);

  const handleConfirmReset = useCallback(() => {
    resetGame();
    clearFloatingNumbers();
    setShowResetDialog(false);
  }, [resetGame, clearFloatingNumbers]);

  const handleShare = useCallback(() => {
    const msg = encodeURIComponent(
      `🏰 *Medieval Clicker*\n📊 Золото: ${formatNumber(game.points)}\n🛡️ Волн: ${game.raid.wave}`
    );
    const url = `https://t.me/share/url?text=${msg}`;
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
  }, [game.points, game.raid.wave]);

  const handleCloseOverlay = useCallback(() => {
    setShowBuildings(false);
    setShowRaid(false);
  }, []);

  const shareToTelegram = useCallback(() => {
    const message = `🏰 Мой замок выдержал ${game.raid.wave} волн гоблинов! Попробуй победить мой результат!`;
    const url = window.encodeURIComponent(window.location.href);
    const telegramUrl = `https://t.me/share/url?url=${url}&text=${window.encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  }, [game.raid.wave]);

  // Computed values
  const repairCost = getTotalRepairCost(game);
  const showRepairButton = needsRepair(game);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] to-[#121812] text-stone-200 relative flex flex-col overflow-hidden font-pixel tracking-wide">
      {/* Raid Notifications */}
      <RaidNotification
        showStart={game.raid.notification}
        showEnd={game.raid.endNotification}
        goblins={game.raid.goblins}
        wave={game.raid.wave}
      />

      {/* Header */}
      <Header
        points={game.points}
        totalIncome={totalIncome}
        onReset={() => setShowResetDialog(true)}
      />

      {/* Main Game Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Castle */}
        <Castle
          ref={castleRef}
          castleHP={game.castleHP}
          maxCastleHP={game.maxCastleHP}
          gameOver={game.gameOver}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />

        {/* Buildings Panel */}
        <BuildingsPanel
          isOpen={showBuildings}
          onClose={() => setShowBuildings(false)}
          buildings={game.buildings}
          points={game.points}
          gameOver={game.gameOver}
          onBuyBuilding={handleBuyBuilding}
          buildingRefs={buildingRefs}
        />

        {/* Raid Panel */}
        <RaidPanel
          isOpen={showRaid}
          onClose={() => setShowRaid(false)}
          raid={game.raid}
          gameOver={game.gameOver}
          onShare={handleShare}
          onTelegramShare={shareToTelegram}
        />

        {/* Floating Controls */}
        <FloatingControls
          showBuildings={showBuildings}
          showRaid={showRaid}
          needsRepair={showRepairButton}
          repairCost={repairCost}
          onToggleBuildings={handleToggleBuildings}
          onToggleRaid={handleToggleRaid}
          onRepairAll={handleRepairAll}
        />

        {/* Floating Numbers */}
        <FloatingNumbers numbers={floatingNumbers} />

        {/* Overlay */}
        {(showBuildings || showRaid) && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
            onClick={handleCloseOverlay}
          />
        )}
      </div>

      {/* Game Over Screen */}
      <GameOverScreen
        isGameOver={game.gameOver}
        wave={game.raid.wave}
        onRestart={handleConfirmReset}
        onTelegramShare={shareToTelegram}
      />

      {/* Reset Dialog */}
      <ResetDialog
        isOpen={showResetDialog}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};

export default App;