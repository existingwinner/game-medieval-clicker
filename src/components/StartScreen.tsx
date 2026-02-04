interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-[#191520] flex items-center justify-center p-4">
      <div className="bg-[#2a2d3c] border-4 border-[#294566] rounded-lg p-6 max-w-sm w-full text-center">
        {/* Заголовок */}
        <div className="text-5xl mb-4">🏰⚔️🛡️</div>
        <h1 className="text-[#f8d877] text-2xl font-bold mb-2">Королевство</h1>
        <p className="text-[#85c4d7] text-sm mb-6">Стратегия-Кликер</p>

        {/* Правила */}
        <div className="bg-[#191520] rounded-lg p-4 mb-6 text-left border border-[#294566]">
          <h2 className="text-[#ffa057] font-bold mb-3 text-center">📜 Как играть</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="text-lg">👆</span>
              <p className="text-[#f0efdf]">
                <strong className="text-[#f8d877]">Кликайте</strong> по замку в центре, чтобы получать золото
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="text-lg">🏗️</span>
              <p className="text-[#f0efdf]">
                <strong className="text-[#f8d877]">Стройте</strong> здания через панель слева {'(>>)'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="text-lg">⚔️</span>
              <p className="text-[#f0efdf]">
                <strong className="text-[#e93f59]">Отбивайте</strong> набеги одичалых (99 волн до победы!)
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="text-lg">🔧</span>
              <p className="text-[#f0efdf]">
                <strong className="text-[#4b7c52]">Чините</strong> здания с помощью мастерских
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="text-lg">✨</span>
              <p className="text-[#f0efdf]">
                <strong className="text-[#9653a2]">Покупайте</strong> баффы за Решимость (храмы!)
              </p>
            </div>
          </div>
        </div>

        {/* Подсказка */}
        <p className="text-[#294566] text-xs mb-4">
          Первый набег через 1 минуту после старта
        </p>

        {/* Кнопка старта */}
        <button
          onClick={onStart}
          className="w-full bg-[#4b7c52] text-white text-xl font-bold py-4 px-8 rounded-lg 
                     hover:bg-[#a0b035] active:scale-95 transition-all
                     border-b-4 border-[#294566] shadow-lg"
        >
          ▶️ Начать игру
        </button>
      </div>
    </div>
  );
}
