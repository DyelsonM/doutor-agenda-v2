import { z } from "zod";

export const updateAppointmentSchema = z.object({
  id: z.string().uuid({
    message: "ID do agendamento é obrigatório.",
  }),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid({
    message: "Médico é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
  appointmentPriceInCents: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  modality: z.string().min(1, {
    message: "Modalidade é obrigatória.",
  }),
});
