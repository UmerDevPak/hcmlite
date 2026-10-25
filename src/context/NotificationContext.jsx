"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const NotificationContext = createContext({
  notify: () => {},
  notifySuccess: () => {},
  notifyError: () => {},
  notifyInfo: () => {},
});

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, type = "info", duration = 4000 }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast = { id, title, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const notifySuccess = useCallback(
    (title, message) => notify({ title, message, type: "success" }),
    [notify]
  );

  const notifyError = useCallback(
    (title, message) => notify({ title, message, type: "error" }),
    [notify]
  );

  const notifyInfo = useCallback(
    (title, message) => notify({ title, message, type: "info" }),
    [notify]
  );

  return (
    <NotificationContext.Provider
      value={{ notify, notifySuccess, notifyError, notifyInfo }}
    >
      {children}
      {/* Toast container floating top-right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-elevated border backdrop-blur-md transition-all duration-200 animate-toast-in ${
              toast.type === "success"
                ? "bg-zinc-950/95 border-emerald-500/40 text-zinc-100 shadow-emerald-950/20"
                : toast.type === "error"
                ? "bg-zinc-950/95 border-rose-500/40 text-zinc-100 shadow-rose-950/30"
                : "bg-zinc-950/95 border-indigo-500/40 text-zinc-100 shadow-indigo-950/20"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              )}
            </div>
            <div className="flex-1 text-sm min-w-0">
              <p className="font-semibold text-xs text-zinc-100">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed break-words">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
