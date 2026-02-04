import { AlertTriangle } from 'lucide-react';

interface ResetDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetDialog = ({ isOpen, onConfirm, onCancel }: ResetDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <div className="bg-stone-950 border border-white/5 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-6" />
        <h3 className="text-lg font-bold text-stone-100 uppercase tracking-widest mb-4">
          Отречение
        </h3>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed font-sans font-bold">
          Вы уверены, что хотите стереть всю историю своего правления?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-rose-600/20 transition-all"
          >
            Сброс
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-stone-400 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/5 transition-all"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
