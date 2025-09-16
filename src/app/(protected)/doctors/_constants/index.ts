import {
  ALL_DOCTOR_SPECIALTIES,
  DOCTOR_SPECIALTIES_BY_CATEGORY,
  getDoctorSpecialtyByCode,
} from "@/constants/medical-specialties";

// Exportar especialidades de médicos para formulários
export const medicalSpecialties = ALL_DOCTOR_SPECIALTIES.map((specialty) => ({
  value: specialty.code,
  label: specialty.name,
}));

// Exportar especialidades organizadas por categoria
export const medicalSpecialtiesByCategory = DOCTOR_SPECIALTIES_BY_CATEGORY;

// Helper para buscar label da especialidade por código
export function getSpecialtyLabel(code: string): string {
  const specialty = getDoctorSpecialtyByCode(code);
  return specialty?.name || code;
}
