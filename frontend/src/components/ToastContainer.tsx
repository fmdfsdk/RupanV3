import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ToastContainer() {
  const toasts = useStore((state) => state.toasts);
  const removeToast = useStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom duration-300 relative overflow-hidden`}
          >
            {/* Colored side indicator bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-[#ff5c00]'
              }`}
            />

            {/* Icon */}
            <div className="pl-1.5 pt-0.5 shrink-0">
              {isSuccess ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : isError ? (
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              ) : (
                <Info className="w-5 h-5 text-[#ff5c00]" />
              )}
            </div>

            {/* Message */}
            <div className="flex-1 text-xs sm:text-sm font-semibold text-gray-800 tracking-tight leading-relaxed text-left">
              {toast.message}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
