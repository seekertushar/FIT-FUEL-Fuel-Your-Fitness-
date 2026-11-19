import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = true,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();
  const resolvedConfirm = confirmLabel ?? t('confirm');
  const resolvedCancel = cancelLabel ?? t('cancel');
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 rounded-xl bg-[#FEF2F2] dark:bg-[#3A1618] p-2.5 text-[#B91C1C] dark:text-[#FCA5A5]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="font-display text-lg font-bold text-[#15191C] dark:text-[#F3F6F2]"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2 text-sm font-medium text-[#202820] dark:text-[#F3F6F2] hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] transition-colors whitespace-nowrap"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              destructive
                ? 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                : 'bg-[#B6F23B] text-[#15191C] hover:bg-[#A4E028]'
            }`}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
