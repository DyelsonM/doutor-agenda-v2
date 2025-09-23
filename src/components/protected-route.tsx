"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  password: string;
  title?: string;
  description?: string;
}

export function ProtectedRoute({
  children,
  password,
  title = "Acesso Restrito",
  description = "Esta área requer uma senha para acesso.",
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se já está autenticado no localStorage
  useEffect(() => {
    const authKey = `financial_auth_${btoa(password)}`;
    const isAuth = localStorage.getItem(authKey);
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular um pequeno delay para melhor UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (inputPassword === password) {
      setIsAuthenticated(true);
      // Salvar autenticação no localStorage (válida por 24h)
      const authKey = `financial_auth_${btoa(password)}`;
      localStorage.setItem(authKey, "true");

      // Definir expiração em 24 horas
      const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(`${authKey}_expires`, expirationTime.toString());
    } else {
      setError("Senha incorreta. Tente novamente.");
      setInputPassword("");
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    const authKey = `financial_auth_${btoa(password)}`;
    localStorage.removeItem(authKey);
    localStorage.removeItem(`${authKey}_expires`);
    setIsAuthenticated(false);
    setInputPassword("");
    setError("");
  };

  // Verificar se a sessão expirou
  useEffect(() => {
    const checkExpiration = () => {
      const authKey = `financial_auth_${btoa(password)}`;
      const expiration = localStorage.getItem(`${authKey}_expires`);

      if (expiration && Date.now() > parseInt(expiration)) {
        handleLogout();
      }
    };

    // Verificar a cada minuto
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, [password]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha de acesso
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Digite a senha"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !inputPassword.trim()}
              >
                {isLoading ? "Verificando..." : "Acessar"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-xs">
                Sessão válida por 24 horas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botão de logout discreto */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-red-200 bg-white/90 text-red-600 backdrop-blur-sm hover:bg-red-50"
        >
          <Lock className="mr-1 h-3 w-3" />
          Sair
        </Button>
      </div>
      {children}
    </div>
  );
}
