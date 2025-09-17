"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateDoctorCredentialsAction } from "@/actions/update-doctor-credentials";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

interface ManageDoctorCredentialsProps {
  doctorId: string;
  doctorName: string;
  children: React.ReactNode;
}

export function ManageDoctorCredentials({
  doctorId,
  doctorName,
  children,
}: ManageDoctorCredentialsProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { execute, isExecuting } = useAction(updateDoctorCredentialsAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || "Credenciais atualizadas com sucesso!");
      // Fechar o dialog após sucesso
      setOpen(false);
      form.reset();
      setShowPassword(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar credenciais");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    execute({
      doctorId,
      ...values,
    });
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
    setShowPassword(false);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  return (
    <>
      <div onClick={handleOpenDialog} className="w-full">
        {children}
      </div>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Login do Médico</DialogTitle>
            <DialogDescription>
              Atualizar email e senha de acesso para{" "}
              <strong>{doctorName}</strong>
              <br />
              <small className="text-muted-foreground">
                💡 Dica: O email pode permanecer o mesmo se você só quiser
                alterar a senha
              </small>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isExecuting}>
                  {isExecuting ? "Atualizando..." : "Atualizar Credenciais"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
