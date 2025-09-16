"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook que detecta quando o dia muda (à meia-noite) e executa uma função callback
 */
export function useDayChange(onDayChange?: () => void) {
  const router = useRouter();

  useEffect(() => {
    const setupMidnightTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        // Executar callback personalizado se fornecido
        if (onDayChange) {
          onDayChange();
        } else {
          // Por padrão, revalidar a página
          router.refresh();
        }

        // Configurar próximo timer para amanhã
        setupMidnightTimer();
      }, timeUntilMidnight);

      return timeout;
    };

    const timeout = setupMidnightTimer();

    // Cleanup no unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [onDayChange, router]);
}
