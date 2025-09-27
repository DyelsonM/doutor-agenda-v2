import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "doctor"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many, one }) => ({
  usersToClinics: many(usersToClinicsTable),
  doctor: one(doctorsTable, {
    fields: [usersTable.id],
    references: [doctorsTable.userId],
  }),
  notifications: many(notificationsTable),
  dailyCash: many(dailyCashTable),
  cashOperations: many(cashOperationsTable),
}));

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  // Informações de contato
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  // Endereço
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("Brasil"),
  // Documentos
  cnpj: text("cnpj"),
  crmNumber: text("crm_number"),
  // Informações adicionais
  description: text("description"),
  // Horário de funcionamento
  openingHours: text("opening_hours"), // JSON object com horários
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  documents: many(documentsTable),
  documentTemplates: many(documentTemplatesTable),
  usersToClinics: many(usersToClinicsTable),
  transactions: many(transactionsTable),
  financialReports: many(financialReportsTable),
  payables: many(payablesTable),
  notifications: many(notificationsTable),
  goldClients: many(goldClientsTable),
  medicalSpecialties: many(medicalSpecialtiesTable),
  partners: many(partnersTable),
  dailyCash: many(dailyCashTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  // 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 0 - Sunday
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  specialty: text("specialty").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    user: one(usersTable, {
      fields: [doctorsTable.userId],
      references: [usersTable.id],
    }),
    appointments: many(appointmentsTable),
    documents: many(documentsTable),
  }),
);

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);
export const patientTypeEnum = pgEnum("patient_type", [
  "particular",
  "cliente ouro",
  "convenio",
  "odontologico",
]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  cpf: text("cpf"), // CPF do paciente (opcional)
  responsiblePhoneNumber: text("responsible_phone_number"),
  responsibleName: text("responsible_name"),
  patientType: patientTypeEnum("patient_type").notNull().default("particular"),
  insuranceName: text("insurance_name"), // Nome do convênio quando for convênio
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sex: patientSexEnum("sex").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
    documents: many(documentsTable),
  }),
);

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  modality: text("modality"), // Modalidade do serviço (opcional para compatibilidade)
  isReturn: boolean("is_return").default(false).notNull(), // Indica se é uma volta do paciente
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
    documents: many(documentsTable),
    transactions: many(transactionsTable),
  }),
);

export const documentTypeEnum = pgEnum("document_type", [
  "anamnesis",
  "prescription",
  "medical_certificate",
  "exam_request",
  "medical_report",
  "referral_form",
  "other",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "appointment_payment",
  "expense",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "rent",
  "utilities",
  "equipment",
  "supplies",
  "marketing",
  "staff",
  "colaborador",
  "insurance",
  "software",
  "laboratory",
  "shipping",
  "other",
]);

export const reportPeriodEnum = pgEnum("report_period", [
  "daily",
  "monthly",
  "yearly",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "cash",
  "pix",
  "bank_transfer",
  "other",
]);

export const documentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(() => appointmentsTable.id, {
    onDelete: "set null",
  }),
  type: documentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const documentTemplatesTable = pgTable("document_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: documentTypeEnum("type").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const documentsTableRelations = relations(documentsTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [documentsTable.clinicId],
    references: [clinicsTable.id],
  }),
  patient: one(patientsTable, {
    fields: [documentsTable.patientId],
    references: [patientsTable.id],
  }),
  doctor: one(doctorsTable, {
    fields: [documentsTable.doctorId],
    references: [doctorsTable.id],
  }),
  appointment: one(appointmentsTable, {
    fields: [documentsTable.appointmentId],
    references: [appointmentsTable.id],
  }),
}));

export const documentTemplatesTableRelations = relations(
  documentTemplatesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [documentTemplatesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// Tabelas Financeiras
export const transactionsTable = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(() => appointmentsTable.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  description: text("description").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  expenseCategory: expenseCategoryEnum("expense_category"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  metadata: text("metadata"), // JSON string para dados adicionais
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const financialReportsTable = pgTable("financial_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  reportType: reportPeriodEnum("report_type").notNull(), // daily, monthly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalRevenue: integer("total_revenue").notNull().default(0),
  totalExpenses: integer("total_expenses").notNull().default(0),
  netProfit: integer("net_profit").notNull().default(0),
  appointmentCount: integer("appointment_count").notNull().default(0),
  averageAppointmentValue: integer("average_appointment_value")
    .notNull()
    .default(0),
  reportData: text("report_data"), // JSON string com dados detalhados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const financialReportsTableRelations = relations(
  financialReportsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [financialReportsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// Enums para contas a pagar
export const payableStatusEnum = pgEnum("payable_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
]);

export const payableCategoryEnum = pgEnum("payable_category", [
  "rent",
  "utilities",
  "equipment",
  "supplies",
  "marketing",
  "staff",
  "colaborador",
  "insurance",
  "software",
  "laboratory",
  "shipping",
  "maintenance",
  "professional_services",
  "taxes",
  "other",
]);

// Tabela de contas a pagar
export const payablesTable = pgTable("payables", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  category: payableCategoryEnum("category").notNull(),
  status: payableStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  supplierName: text("supplier_name"),
  supplierDocument: text("supplier_document"), // CPF/CNPJ
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const payablesTableRelations = relations(payablesTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [payablesTable.clinicId],
    references: [clinicsTable.id],
  }),
}));

// Enums para notificações - usando os tipos já existentes
export const notificationStatusEnum = pgEnum("notification_status", [
  "unread",
  "read",
  "archived",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "appointment_reminder",
  "appointment_cancelled",
  "appointment_completed",
  "payment_received",
  "payment_overdue",
  "payable_due",
  "payable_overdue",
  "system_update",
  "backup_completed",
  "backup_failed",
]);

// Tabela de notificações - usando a estrutura existente
export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").notNull().default("unread"),
  data: text("data"), // JSON string com dados extras
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationsTableRelations = relations(
  notificationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [notificationsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [notificationsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// Tabelas para Cliente Ouro
export const goldClientsTable = pgTable("gold_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  // Dados do titular
  holderName: text("holder_name").notNull(),
  holderCpf: text("holder_cpf").notNull(),
  holderPhone: text("holder_phone").notNull(),
  holderBirthDate: timestamp("holder_birth_date").notNull(),
  holderAddress: text("holder_address").notNull(),
  holderZipCode: text("holder_zip_code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const goldClientDependentsTable = pgTable("gold_client_dependents", {
  id: uuid("id").defaultRandom().primaryKey(),
  goldClientId: uuid("gold_client_id")
    .notNull()
    .references(() => goldClientsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const goldClientsTableRelations = relations(
  goldClientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [goldClientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    dependents: many(goldClientDependentsTable),
  }),
);

export const goldClientDependentsTableRelations = relations(
  goldClientDependentsTable,
  ({ one }) => ({
    goldClient: one(goldClientsTable, {
      fields: [goldClientDependentsTable.goldClientId],
      references: [goldClientsTable.id],
    }),
  }),
);

// Tabela de modalidades de agendamento
export const appointmentModalitiesTable = pgTable("appointment_modalities", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // Código único da modalidade (ex: "consulta_clinico_geral")
  name: text("name").notNull(), // Nome da modalidade (ex: "Consulta Clínico Geral")
  category: text("category").notNull(), // Categoria (ex: "Consultas Especializadas", "Fisioterapia")
  description: text("description"), // Descrição opcional
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentModalitiesTableRelations = relations(
  appointmentModalitiesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentModalitiesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// Tabela de especialidades médicas
export const medicalSpecialtiesTable = pgTable("medical_specialties", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // Código único da especialidade (ex: "cardiologista")
  name: text("name").notNull(), // Nome da especialidade (ex: "Cardiologista")
  category: text("category").notNull(), // Categoria (ex: "Medicina", "Terapeutas")
  description: text("description"), // Descrição opcional
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const medicalSpecialtiesTableRelations = relations(
  medicalSpecialtiesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [medicalSpecialtiesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// Enums para parceiros
export const paymentFrequencyEnum = pgEnum("payment_frequency", [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
]);

export const pixTypeEnum = pgEnum("pix_type", [
  "cpf",
  "cnpj",
  "email",
  "phone",
  "random_key",
]);

// Tabela de parceiros
export const partnersTable = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  // Dados da empresa
  companyName: text("company_name").notNull(), // Razão Social
  tradeName: text("trade_name"), // Nome Fantasia
  cnpj: text("cnpj").notNull(),
  address: text("address").notNull(),
  // Dados do responsável
  responsibleName: text("responsible_name").notNull(),
  responsiblePhone: text("responsible_phone").notNull(),
  // Telefones de recepção para agendamento (3 espaços)
  receptionPhone1: text("reception_phone_1"),
  receptionPhone2: text("reception_phone_2"),
  receptionPhone3: text("reception_phone_3"),
  // Configurações de pagamento
  paymentFrequency: paymentFrequencyEnum("payment_frequency").notNull(),
  pixKey: text("pix_key").notNull(),
  pixType: pixTypeEnum("pix_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela de exames dos parceiros
export const partnerExamsTable = pgTable("partner_exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partnersTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // Código ou sigla do exame
  name: text("name").notNull(), // Nome do exame
  popularPriceInCents: integer("popular_price_in_cents"), // Valor CL Popular
  particularPriceInCents: integer("particular_price_in_cents"), // Valor Particular
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const partnerExamsTableRelations = relations(
  partnerExamsTable,
  ({ one }) => ({
    partner: one(partnersTable, {
      fields: [partnerExamsTable.partnerId],
      references: [partnersTable.id],
    }),
  }),
);

export const partnersTableRelations = relations(
  partnersTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [partnersTable.clinicId],
      references: [clinicsTable.id],
    }),
    exams: many(partnerExamsTable),
  }),
);

// Enums para sistema de caixa diário
export const cashStatusEnum = pgEnum("cash_status", [
  "open",
  "closed",
  "suspended",
]);

export const cashOperationTypeEnum = pgEnum("cash_operation_type", [
  "opening",
  "closing",
  "cash_in",
  "cash_out",
  "adjustment",
]);

// Tabela de caixa diário
export const dailyCashTable = pgTable("daily_cash", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(), // Data do caixa (sem horário)
  openingTime: timestamp("opening_time").notNull(), // Horário de abertura
  closingTime: timestamp("closing_time"), // Horário de fechamento
  status: cashStatusEnum("status").notNull().default("open"),
  // Valores em centavos
  openingAmount: integer("opening_amount").notNull().default(0), // Valor inicial do caixa
  closingAmount: integer("closing_amount"), // Valor final do caixa
  expectedAmount: integer("expected_amount"), // Valor esperado (calculado)
  difference: integer("difference"), // Diferença entre esperado e real
  // Totais do dia
  totalRevenue: integer("total_revenue").notNull().default(0),
  totalExpenses: integer("total_expenses").notNull().default(0),
  totalCashIn: integer("total_cash_in").notNull().default(0), // Entradas de dinheiro
  totalCashOut: integer("total_cash_out").notNull().default(0), // Saídas de dinheiro
  // Observações
  openingNotes: text("opening_notes"),
  closingNotes: text("closing_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tabela de operações de caixa
export const cashOperationsTable = pgTable("cash_operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  dailyCashId: uuid("daily_cash_id")
    .notNull()
    .references(() => dailyCashTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: cashOperationTypeEnum("type").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  description: text("description").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  // Referência à transação relacionada (opcional)
  transactionId: uuid("transaction_id").references(() => transactionsTable.id, {
    onDelete: "set null",
  }),
  // Dados adicionais em JSON
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relações das tabelas financeiras
export const transactionsTableRelations = relations(
  transactionsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [transactionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [transactionsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    cashOperations: many(cashOperationsTable),
  }),
);

// Relações das tabelas de caixa
export const dailyCashTableRelations = relations(
  dailyCashTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [dailyCashTable.clinicId],
      references: [clinicsTable.id],
    }),
    user: one(usersTable, {
      fields: [dailyCashTable.userId],
      references: [usersTable.id],
    }),
    operations: many(cashOperationsTable),
  }),
);

export const cashOperationsTableRelations = relations(
  cashOperationsTable,
  ({ one }) => ({
    dailyCash: one(dailyCashTable, {
      fields: [cashOperationsTable.dailyCashId],
      references: [dailyCashTable.id],
    }),
    user: one(usersTable, {
      fields: [cashOperationsTable.userId],
      references: [usersTable.id],
    }),
    transaction: one(transactionsTable, {
      fields: [cashOperationsTable.transactionId],
      references: [transactionsTable.id],
    }),
  }),
);
