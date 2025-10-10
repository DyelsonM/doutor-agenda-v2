"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

/**
 * Hook que detecta quando o dia muda (à meia-noite) e executa uma função callback
 * Otimizado para evitar re-criação desnecessária de timers
 */
export function useDayChange(onDayChange?: () => void) {
  const router = useRouter();

  const handleDayChange = useCallback(() => {
    if (onDayChange) {
      onDayChange();
    } else {
      // Por padrão, revalidar a página
      router.refresh();
    }
  }, [onDayChange, router]);

  useEffect(() => {
    const setupMidnightTimer = (): NodeJS.Timeout => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      return setTimeout(() => {
        handleDayChange();
        // Configurar próximo timer para amanhã
        setupMidnightTimer();
      }, timeUntilMidnight);
    };

    const timeout = setupMidnightTimer();

    // Cleanup no unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [handleDayChange]); // Apenas handleDayChange como dependência
}
