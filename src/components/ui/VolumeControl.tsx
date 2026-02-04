import { useState, useEffect } from 'react';
import { setGlobalVolume, getGlobalVolume, playClickSound } from '../../utils/sounds';

export function VolumeControl() {
  const [volume, setVolume] = useState(getGlobalVolume());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setGlobalVolume(volume);
  }, [volume]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          playClickSound();
        }}
        className="p-1.5 bg-[#2a2d3c] rounded border border-[#294566] text-[#f8d877] hover:bg-[#294566] transition-colors"
        title="Громкость"
      >
        {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-2 p-3 bg-[#2a2d3c] border-2 border-[#294566] rounded-lg shadow-xl z-50 flex items-center gap-3 animate-bounce-in">
            <span className="text-sm">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32 accent-[#f8d877]"
            />
            <span className="text-sm">🔊</span>
            <div className="text-[#f8d877] font-bold text-xs w-6">
              {Math.round(volume * 100)}%
            </div>
          </div>
        </>
      )}
    </div>
  );
}
