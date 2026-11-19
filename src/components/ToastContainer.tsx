import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 no-print"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#15191C] dark:text-[#B6F23B] shrink-0" />
          );

        return (
          <div
            key={toast.id}
            role="status"
            className="flex items-start gap-3 rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-3 shadow-lg text-sm text-[#202820] dark:text-[#F3F6F2]"
          >
            <span className="mt-0.5">{icon}</span>
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-[#5B655D] hover:text-[#15191C] dark:text-[#9BA59D] dark:hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
