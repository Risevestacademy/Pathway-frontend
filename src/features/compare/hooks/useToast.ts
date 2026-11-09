import { useCallback, useEffect, useRef, useState } from "react";

const SHOW_MS = 3500;
const EXIT_MS = 200;

export interface ToastState {
  id: number;
  message: string;
  open: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timers = useRef<number[]>([]);
  const counter = useRef(0);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const show = useCallback((message: string) => {
    clearTimers();
    counter.current += 1;
    const id = counter.current;
    setToast({ id, message, open: true });
    timers.current = [
      window.setTimeout(
        () => setToast((current) => (current?.id === id ? { ...current, open: false } : current)),
        SHOW_MS,
      ),
      window.setTimeout(
        () => setToast((current) => (current?.id === id ? null : current)),
        SHOW_MS + EXIT_MS,
      ),
    ];
  }, []);

  useEffect(() => clearTimers, []);

  return { toast, show };
}