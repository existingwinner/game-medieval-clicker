import { useState } from 'react';
import { RaidState, MAX_WAVES } from '../types/game';

interface RaidPanelProps {
  raid: RaidState;
  messages: string[];
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  showToggleButton?: boolean;
}

export function RaidPanel({ raid, messages, isOpen, onToggle, showToggleButton = true }: RaidPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onToggle ?? setInternalOpen;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Расчет следующего набега
  const nextEnemyCount = Math.floor(3 * Math.pow(1.2, raid.wave + 1));
  const progress = (raid.wave / MAX_WAVES) * 100;

  return (
    <>
      {/* Кнопка открытия */}
      {showToggleButton && (
        <button
          onClick={() => setOpen(!open)}
          className={`
            fixed right-0 top-1/2 -translate-y-1/2 z-50 border-2 
            px-2 py-5 rounded-l-lg font-bold transition-colors
            ${raid.isActive 
              ? 'raid-button-pulse border-[#723738] text-white' 
              : open 
                ? 'bg-[#2a2d3c] border-[#294566] text-[#f8d877]'
                : 'panel-button-pulse border-[#294566] text-[#f8d877]'
            }
          `}
        >
          {open ? '▶' : '⚔️'}
        </button>
      )}

      {/* Панель */}
      <div
        id="raid-panel"
        className={`
        fixed right-0 top-0 h-full w-[70vw] max-w-64 bg-[#191520] border-l-2 border-[#294566] z-40
        transform transition-transform duration-300 overflow-hidden
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Заголовок */}
          <div className="p-3 bg-[#2a2d3c] border-b-2 border-[#294566]">
            <h2 className="text-[#f8d877] font-bold text-center">⚔️ Набеги</h2>
          </div>

          {/* Статус */}
          <div className="p-3 bg-[#2a2d3c]/50 border-b-2 border-[#294566] space-y-2">
            {/* Прогресс игры */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#85c4d7]">Прогресс</span>
                <span className="text-[#f8d877]">{raid.wave}/{MAX_WAVES}</span>
              </div>
              <div className="h-2 bg-[#191520] rounded overflow-hidden border border-[#294566]">
                <div 
                  className="h-full bg-[#4b7c52] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Активный рейд */}
            {raid.isActive ? (
              <>
                {/* Обратный отсчёт рейда */}
                <div className="bg-[#e93f59]/20 border border-[#e93f59] rounded p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#e93f59] font-bold">⚔️ НАБЕГ!</span>
                    <span className="text-white font-bold text-lg">
                      {Math.ceil(raid.raidTimeLeft)}с
                    </span>
                  </div>
                  
                  {/* Прогресс-бар времени рейда */}
                  <div className="h-2 bg-[#191520] rounded overflow-hidden mb-2">
                    <div 
                      className="h-full bg-[#e93f59] transition-all duration-100"
                      style={{ width: `${(raid.raidTimeLeft / raid.raidDuration) * 100}%` }}
                    />
                  </div>
                  
                  {/* Враги атакуют одновременно */}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#f0efdf]">Одичалые:</span>
                    <span className="text-[#ffa057] font-bold">
                      {raid.enemyCount} ⚔️
                    </span>
                  </div>
                  
                  {/* Общее кол-во атак */}
                  <div className="text-xs text-[#85c4d7] mt-1 text-center">
                    Все атакуют одновременно!
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Таймер до следующего рейда */}
                <div className="flex justify-between items-center">
                  <span className="text-[#85c4d7] text-sm">До набега:</span>
                  <span className="text-[#ffa057] font-bold text-lg">
                    {formatTime(raid.timeToNextRaid)}
                  </span>
                </div>

                {/* Прогресс таймера */}
                <div className="h-1 bg-[#191520] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[#ffa057] transition-all duration-100"
                    style={{ width: `${(1 - raid.timeToNextRaid / raid.totalTimeToNextRaid) * 100}%` }}
                  />
                </div>

                {/* Следующая волна */}
                <div className="text-sm text-[#85c4d7] text-center font-medium">
                  Ожидается: ~{nextEnemyCount} одичалых
                </div>
              </>
            )}
          </div>

          {/* Лог сообщений */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            <div className="text-[#85c4d7] text-sm font-bold mb-2">📜 Журнал:</div>
            {messages.length === 0 ? (
              <p className="text-[#294566] text-sm text-center">Пока тихо...</p>
            ) : (
              messages.slice().reverse().map((msg, i) => (
                <div 
                  key={i} 
                  className="text-sm p-1.5 bg-[#2a2d3c] rounded border border-[#294566] text-[#f0efdf]"
                >
                  {msg}
                </div>
              ))
            )}
          </div>

          {/* Подсказки */}
          <div className="p-2 bg-[#294566] border-t-2 border-[#2c6cba]">
            <p className="text-[#f0efdf] text-sm text-center">
              💡 Стройте Башни для -5% урона
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
