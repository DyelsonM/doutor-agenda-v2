/**
 * Configuração de senhas para páginas protegidas
 *
 * IMPORTANTE: Altere estas senhas para valores seguros em produção!
 * Recomenda-se usar senhas com pelo menos 8 caracteres, incluindo:
 * - Letras maiúsculas e minúsculas
 * - Números
 * - Símbolos especiais
 */

export const PAGE_PASSWORDS = {
  // Senha para a página financeiro
  FINANCIAL: "Admin123!@#",

  // Adicione outras senhas conforme necessário
  // REPORTS: "Reports456$",
  // ADMIN: "SuperAdmin789&",
} as const;

// Função para validar força da senha (opcional)
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Senha deve ter pelo menos 8 caracteres",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Senha deve conter pelo menos uma letra maiúscula",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Senha deve conter pelo menos uma letra minúscula",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Senha deve conter pelo menos um número",
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Senha deve conter pelo menos um símbolo especial",
    };
  }

  return {
    isValid: true,
    message: "Senha válida",
  };
}
