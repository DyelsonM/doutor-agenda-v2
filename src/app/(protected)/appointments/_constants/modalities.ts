import {
  ALL_APPOINTMENT_MODALITIES,
  APPOINTMENT_MODALITIES_BY_CATEGORY,
  getAppointmentModalityByCode,
} from "@/constants/medical-specialties";

// Exportar modalidades de agendamento para formulários
export const appointmentModalities = ALL_APPOINTMENT_MODALITIES.map(
  (modality) => ({
    value: modality.code,
    label: modality.name,
  }),
);

// Exportar modalidades organizadas por categoria
export const appointmentModalitiesByCategory =
  APPOINTMENT_MODALITIES_BY_CATEGORY;

// Helper para buscar label da modalidade por código
export function getModalityLabel(code: string): string {
  const modality = getAppointmentModalityByCode(code);
  return modality?.name || code;
}
