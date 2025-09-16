import { pgTable, text, timestamp, foreignKey, uuid, unique, integer, time, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const documentType = pgEnum("document_type", ['anamnesis', 'prescription', 'medical_certificate', 'exam_request', 'medical_report', 'other'])
export const expenseCategory = pgEnum("expense_category", ['rent', 'utilities', 'equipment', 'supplies', 'marketing', 'staff', 'insurance', 'software', 'laboratory', 'shipping', 'other'])
export const notificationStatus = pgEnum("notification_status", ['unread', 'read', 'archived'])
export const notificationType = pgEnum("notification_type", ['appointment_reminder', 'appointment_cancelled', 'appointment_completed', 'payment_received', 'payment_overdue', 'payable_due', 'payable_overdue', 'system_update', 'backup_completed', 'backup_failed', 'subscription_expiring', 'subscription_expired'])
export const patientSex = pgEnum("patient_sex", ['male', 'female'])
export const patientType = pgEnum("patient_type", ['particular', 'cliente_oro', 'convenio'])
export const payableCategory = pgEnum("payable_category", ['rent', 'utilities', 'equipment', 'supplies', 'marketing', 'staff', 'insurance', 'software', 'laboratory', 'shipping', 'maintenance', 'professional_services', 'taxes', 'other'])
export const payableStatus = pgEnum("payable_status", ['pending', 'paid', 'overdue', 'cancelled'])
export const paymentMethod = pgEnum("payment_method", ['stripe', 'cash', 'pix', 'bank_transfer', 'other'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'completed', 'failed', 'cancelled', 'refunded'])
export const reportPeriod = pgEnum("report_period", ['daily', 'monthly', 'yearly'])
export const transactionType = pgEnum("transaction_type", ['appointment_payment', 'subscription_payment', 'refund', 'expense', 'other'])
export const userRole = pgEnum("user_role", ['admin', 'doctor'])


export const verifications = pgTable("verifications", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const patients = pgTable("patients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phoneNumber: text("phone_number").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	sex: patientSex().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	responsiblePhoneNumber: text("responsible_phone_number"),
	patientType: patientType("patient_type").default('particular').notNull(),
	insuranceName: text("insurance_name"),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "patients_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_token_unique").on(table.token),
]);

export const doctors = pgTable("doctors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	name: text().notNull(),
	avatarImageUrl: text("avatar_image_url"),
	availableFromWeekDay: integer("available_from_week_day").notNull(),
	availableToWeekDay: integer("available_to_week_day").notNull(),
	availableFromTime: time("available_from_time").notNull(),
	availableToTime: time("available_to_time").notNull(),
	specialty: text().notNull(),
	appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "doctors_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "doctors_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const usersToClinics = pgTable("users_to_clinics", {
	userId: text("user_id").notNull(),
	clinicId: uuid("clinic_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "users_to_clinics_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "users_to_clinics_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const clinics = pgTable("clinics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	logoUrl: text("logo_url"),
	email: text(),
	phone: text(),
	website: text(),
	address: text(),
	city: text(),
	state: text(),
	zipCode: text("zip_code"),
	country: text().default('Brasil'),
	cnpj: text(),
	crmNumber: text("crm_number"),
	description: text(),
	openingHours: text("opening_hours"),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	plan: text(),
	role: userRole().default('admin').notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const appointments = pgTable("appointments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	clinicId: uuid("clinic_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "appointments_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "appointments_patient_id_patients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "appointments_doctor_id_doctors_id_fk"
		}).onDelete("cascade"),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	appointmentId: uuid("appointment_id"),
	type: documentType().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "documents_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "documents_patient_id_patients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "documents_doctor_id_doctors_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "documents_appointment_id_appointments_id_fk"
		}).onDelete("set null"),
]);

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	appointmentId: uuid("appointment_id"),
	type: transactionType().notNull(),
	amountInCents: integer("amount_in_cents").notNull(),
	description: text().notNull(),
	paymentMethod: paymentMethod("payment_method").notNull(),
	status: paymentStatus().default('pending').notNull(),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	stripeChargeId: text("stripe_charge_id"),
	metadata: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	expenseCategory: expenseCategory("expense_category"),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "transactions_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "transactions_appointment_id_appointments_id_fk"
		}).onDelete("set null"),
]);

export const financialReports = pgTable("financial_reports", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	reportType: reportPeriod("report_type").notNull(),
	periodStart: timestamp("period_start", { mode: 'string' }).notNull(),
	periodEnd: timestamp("period_end", { mode: 'string' }).notNull(),
	totalRevenue: integer("total_revenue").default(0).notNull(),
	totalExpenses: integer("total_expenses").default(0).notNull(),
	netProfit: integer("net_profit").default(0).notNull(),
	appointmentCount: integer("appointment_count").default(0).notNull(),
	averageAppointmentValue: integer("average_appointment_value").default(0).notNull(),
	reportData: text("report_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "financial_reports_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const payables = pgTable("payables", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	description: text().notNull(),
	amountInCents: integer("amount_in_cents").notNull(),
	category: payableCategory().notNull(),
	status: payableStatus().default('pending').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }).notNull(),
	paidDate: timestamp("paid_date", { mode: 'string' }),
	supplierName: text("supplier_name"),
	supplierDocument: text("supplier_document"),
	invoiceNumber: text("invoice_number"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "payables_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const documentTemplates = pgTable("document_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull(),
	name: text().notNull(),
	type: documentType().notNull(),
	content: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "document_templates_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	clinicId: uuid("clinic_id").notNull(),
	type: notificationType().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	status: notificationStatus().default('unread').notNull(),
	data: text(),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "notifications_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);
