"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Kind = "success" | "error";
type Toast = { id: number; kind: Kind; message: string };
type Api = { success: (m: string) => void; error: (m: string) => void };
const Ctx = createContext<Api | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((kind: Kind, message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000);
  }, [dismiss]);

  const api = useMemo<Api>(() => ({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  }), [push]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div aria-live="polite" className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm ${
              t.kind === "success" ? "border-success/30 bg-successLight" : "border-danger/30 bg-dangerLight"}`}>
            {t.kind === "success"
              ? <CheckCircle2 size={18} className="mt-0.5 text-success" />
              : <AlertCircle size={18} className="mt-0.5 text-danger" />}
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss"><X size={16} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = (): Api =>
  useContext(Ctx) ?? { success: () => {}, error: () => {} };