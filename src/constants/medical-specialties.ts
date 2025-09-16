// Especialidades dos médicos (categorias principais)
export const DOCTOR_SPECIALTIES = {
  MEDICINA: {
    category: "Medicina",
    specialties: [
      { code: "clinico_geral", name: "Clínico Geral" },
      { code: "cardiologista", name: "Cardiologista" },
      { code: "ginecologista", name: "Ginecologista" },
      { code: "ortopedista", name: "Ortopedista" },
      { code: "geriatra", name: "Geriatra" },
      { code: "neurologista", name: "Neurologista" },
      { code: "psiquiatra", name: "Psiquiatra" },
      { code: "pediatra", name: "Pediatra" },
      { code: "medicina_do_trabalho", name: "Medicina do Trabalho" },
    ],
  },
  TERAPEUTAS: {
    category: "Terapeutas",
    specialties: [
      { code: "fisioterapeuta", name: "Fisioterapeuta" },
      { code: "nutricionista", name: "Nutricionista" },
      { code: "fonoaudiologo", name: "Fonoaudiólogo" },
      { code: "psicologo", name: "Psicólogo" },
      { code: "neuropsicólogo", name: "Neuropsicólogo" },
      { code: "terapeuta_ocupacional", name: "Terapeuta Ocupacional" },
    ],
  },
  ODONTOLOGIA: {
    category: "Odontologia",
    specialties: [
      { code: "dentista_geral", name: "Dentista Geral" },
      { code: "cirurgiao_dentista", name: "Cirurgião Dentista" },
      { code: "ortodontista", name: "Ortodontista" },
      { code: "endodontista", name: "Endodontista" },
    ],
  },
  ESTETICA: {
    category: "Estética",
    specialties: [
      { code: "esteticista", name: "Esteticista" },
      { code: "massoterapeuta", name: "Massoterapeuta" },
    ],
  },
  DIAGNOSTICO: {
    category: "Diagnóstico",
    specialties: [
      { code: "tecnico_laboratorio", name: "Técnico de Laboratório" },
      { code: "tecnico_radiologia", name: "Técnico em Radiologia" },
      { code: "biomédico", name: "Biomédico" },
    ],
  },
} as const;

// Modalidades de atendimento (serviços específicos)
export const APPOINTMENT_MODALITIES = {
  CONSULTAS_ESPECIALIZADAS: {
    category: "Consultas Especializadas",
    modalities: [
      { code: "consulta_clinico_geral", name: "Consulta Clínico Geral" },
      { code: "consulta_cardiologica", name: "Consulta Cardiológica" },
      { code: "consulta_ginecologica", name: "Consulta Ginecológica" },
      { code: "consulta_ortopedica", name: "Consulta Ortopédica" },
      { code: "consulta_geriatrica", name: "Consulta Geriátrica" },
      { code: "consulta_nutricional", name: "Consulta Nutricional" },
      { code: "consulta_pediatrica", name: "Consulta Pediátrica" },
      { code: "consulta_neurologica", name: "Consulta Neurológica" },
      { code: "sessao_fonoaudiologia", name: "Sessão de Fonoaudiologia" },
      { code: "sessao_psicologia", name: "Sessão de Psicologia" },
      { code: "sessao_neuropsicologia", name: "Sessão de Neuropsicologia" },
      { code: "consulta_psiquiatrica", name: "Consulta Psiquiátrica" },
      {
        code: "sessao_terapia_ocupacional",
        name: "Sessão de Terapia Ocupacional",
      },
    ],
  },
  FISIOTERAPIA: {
    category: "Fisioterapia",
    modalities: [
      { code: "fisio_clinica_domiciliar", name: "Fisio Clínica e Domiciliar" },
      { code: "acupuntura", name: "Acupuntura" },
      { code: "rpg", name: "RPG" },
      { code: "pilates", name: "Pilates" },
      { code: "ventosaterapia", name: "Ventosaterapia" },
    ],
  },
  EXAMES_OCUPACIONAIS: {
    category: "Exames Ocupacionais",
    modalities: [
      { code: "exame_admissional", name: "Exame Admissional" },
      { code: "exame_demissional", name: "Exame Demissional" },
      { code: "exame_periodico", name: "Exame Periódico" },
    ],
  },
  ESTETICA: {
    category: "Estética",
    modalities: [
      { code: "limpeza_pele", name: "Limpeza de Pele" },
      { code: "lipo_papada", name: "Lipo de Papada" },
      {
        code: "tratamento_celulite_estrias",
        name: "Tratamento Celulite e Estrias",
      },
      { code: "tratamento_micro", name: "Tratamento de Micro" },
      { code: "vaso_varizes", name: "Vaso (Varizes)" },
      { code: "massagem_modeladora", name: "Massagem Modeladora" },
      { code: "massagem_relaxante", name: "Massagem Relaxante" },
    ],
  },
  EXAMES_LABORATORIAIS: {
    category: "Exames Laboratoriais",
    modalities: [
      { code: "hemograma_completo", name: "Hemograma Completo" },
      { code: "glicose", name: "Glicose" },
      { code: "colesterol_total", name: "Colesterol Total" },
      { code: "cultura_urina", name: "Cultura de Urina" },
      { code: "parasitologico_fezes", name: "Parasitológico de Fezes" },
      { code: "toxicologico_dentra", name: "Toxicológico / Dentra" },
    ],
  },
  ODONTOLOGIA: {
    category: "Odontologia",
    modalities: [
      { code: "odonto_clinico_geral", name: "Consulta Odontológica Geral" },
      { code: "odonto_urgencia", name: "Urgência Odontológica" },
      {
        code: "instalacao_manutencao_aparelho",
        name: "Instalação e Manutenção de Aparelho",
      },
      { code: "protese_dentaria", name: "Prótese Dentária" },
      { code: "odonto_cirurgia", name: "Cirurgia Odontológica" },
      { code: "canal", name: "Tratamento de Canal" },
    ],
  },
  EXAMES_IMAGEM: {
    category: "Exames de Imagem",
    modalities: [
      { code: "tomografia", name: "Tomografia" },
      { code: "ressonancia_magnetica", name: "Ressonância Magnética" },
      { code: "densitometria_ossea", name: "Densitometria Óssea" },
      { code: "mamografia", name: "Mamografia" },
      { code: "ultrassonografia", name: "Ultrassonografia" },
      { code: "raio_x", name: "Raio X" },
    ],
  },
  EXAMES_ESPECIALIZADOS: {
    category: "Exames Especializados",
    modalities: [
      { code: "eletroneuromiografia", name: "Eletroneuromiografia" },
      {
        code: "prova_funcao_pulmonar",
        name: "Prova de Função Pulmonar / Espirometria",
      },
      {
        code: "colposcopia_citologia",
        name: "Colposcopia / Citologia Oncótica",
      },
    ],
  },
} as const;

// === ESPECIALIDADES DOS MÉDICOS ===

// Lista plana de todas as especialidades de médicos
export const ALL_DOCTOR_SPECIALTIES = Object.values(DOCTOR_SPECIALTIES)
  .flatMap((category) => category.specialties)
  .sort((a, b) => a.name.localeCompare(b.name));

// Lista organizada por categoria para exibição em grupos
export const DOCTOR_SPECIALTIES_BY_CATEGORY = Object.entries(
  DOCTOR_SPECIALTIES,
).map(([key, category]) => ({
  categoryKey: key,
  categoryName: category.category,
  specialties: category.specialties,
}));

// Função helper para buscar especialidade de médico por código
export function getDoctorSpecialtyByCode(code: string) {
  return ALL_DOCTOR_SPECIALTIES.find((specialty) => specialty.code === code);
}

// Lista de códigos válidos para validação de especialidades de médicos
export const VALID_DOCTOR_SPECIALTY_CODES = ALL_DOCTOR_SPECIALTIES.map(
  (s) => s.code,
);

// === MODALIDADES DE AGENDAMENTO ===

// Lista plana de todas as modalidades de agendamento
export const ALL_APPOINTMENT_MODALITIES = Object.values(APPOINTMENT_MODALITIES)
  .flatMap((category) => category.modalities)
  .sort((a, b) => a.name.localeCompare(b.name));

// Lista organizada por categoria para exibição em grupos
export const APPOINTMENT_MODALITIES_BY_CATEGORY = Object.entries(
  APPOINTMENT_MODALITIES,
).map(([key, category]) => ({
  categoryKey: key,
  categoryName: category.category,
  modalities: category.modalities,
}));

// Função helper para buscar modalidade de agendamento por código
export function getAppointmentModalityByCode(code: string) {
  return ALL_APPOINTMENT_MODALITIES.find((modality) => modality.code === code);
}

// Lista de códigos válidos para validação de modalidades de agendamento
export const VALID_APPOINTMENT_MODALITY_CODES = ALL_APPOINTMENT_MODALITIES.map(
  (m) => m.code,
);

// === COMPATIBILIDADE (manter para não quebrar código existente) ===

// @deprecated - Use ALL_DOCTOR_SPECIALTIES para médicos ou ALL_APPOINTMENT_MODALITIES para agendamentos
export const ALL_SPECIALTIES = ALL_DOCTOR_SPECIALTIES;

// @deprecated - Use DOCTOR_SPECIALTIES_BY_CATEGORY
export const SPECIALTIES_BY_CATEGORY = DOCTOR_SPECIALTIES_BY_CATEGORY;

// @deprecated - Use getDoctorSpecialtyByCode
export function getSpecialtyByCode(code: string) {
  // Tenta primeiro nas especialidades de médicos, depois nas modalidades
  return getDoctorSpecialtyByCode(code) || getAppointmentModalityByCode(code);
}
