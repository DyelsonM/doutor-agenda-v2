"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CredentialsDisplayProps {
  credentials: {
    email: string;
    password: string;
  };
  doctorName: string;
  onClose: () => void;
}

export function CredentialsDisplay({
  credentials,
  doctorName,
  onClose,
}: CredentialsDisplayProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-700">
          ✅ Usuário Criado com Sucesso!
        </CardTitle>
        <CardDescription className="text-green-600">
          <strong>IMPORTANTE:</strong> Anote estas credenciais e compartilhe com{" "}
          {doctorName}. Elas não serão exibidas novamente!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            📧 Email:
          </label>
          <div className="flex items-center gap-2">
            <p className="flex-1 rounded border bg-white p-3 font-mono text-sm select-all">
              {credentials.email}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(credentials.email);
                toast.success("Email copiado!");
                setHasInteracted(true);
              }}
            >
              📋
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            🔑 Senha:
          </label>
          <div className="flex items-center gap-2">
            <p className="flex-1 rounded border bg-white p-3 font-mono text-sm select-all">
              {credentials.password}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(credentials.password);
                toast.success("Senha copiada!");
                setHasInteracted(true);
              }}
            >
              📋
            </Button>
          </div>
        </div>
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          ⚠️ <strong>ATENÇÃO:</strong> Copie estas credenciais AGORA! Elas não
          serão exibidas novamente depois que você fechar este dialog.
        </div>
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          💡 <strong>Dica:</strong> O médico deve fazer login em{" "}
          <code>/authentication</code> com essas credenciais.
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="acknowledged"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="acknowledged" className="text-sm font-medium">
              Eu copiei as credenciais e confirmo que posso fechar este dialog
              {!hasInteracted && (
                <span className="text-amber-600">
                  {" "}
                  (copie pelo menos uma credencial primeiro)
                </span>
              )}
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              disabled={!acknowledged || !hasInteracted}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Fechar e Finalizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
