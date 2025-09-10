import { z } from "zod";

export const createDoctorUserSchema = z.object({
  doctorId: z.string().uuid("ID do médico é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});
