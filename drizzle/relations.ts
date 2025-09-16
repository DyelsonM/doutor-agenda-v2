import { relations } from "drizzle-orm/relations";
import { clinics, patients, users, accounts, sessions, doctors, usersToClinics, appointments, documents, transactions, financialReports, payables, documentTemplates, notifications } from "./schema";

export const patientsRelations = relations(patients, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [patients.clinicId],
		references: [clinics.id]
	}),
	appointments: many(appointments),
	documents: many(documents),
}));

export const clinicsRelations = relations(clinics, ({many}) => ({
	patients: many(patients),
	doctors: many(doctors),
	usersToClinics: many(usersToClinics),
	appointments: many(appointments),
	documents: many(documents),
	transactions: many(transactions),
	financialReports: many(financialReports),
	payables: many(payables),
	documentTemplates: many(documentTemplates),
	notifications: many(notifications),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	doctors: many(doctors),
	usersToClinics: many(usersToClinics),
	notifications: many(notifications),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [doctors.clinicId],
		references: [clinics.id]
	}),
	user: one(users, {
		fields: [doctors.userId],
		references: [users.id]
	}),
	appointments: many(appointments),
	documents: many(documents),
}));

export const usersToClinicsRelations = relations(usersToClinics, ({one}) => ({
	user: one(users, {
		fields: [usersToClinics.userId],
		references: [users.id]
	}),
	clinic: one(clinics, {
		fields: [usersToClinics.clinicId],
		references: [clinics.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [appointments.clinicId],
		references: [clinics.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	doctor: one(doctors, {
		fields: [appointments.doctorId],
		references: [doctors.id]
	}),
	documents: many(documents),
	transactions: many(transactions),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	clinic: one(clinics, {
		fields: [documents.clinicId],
		references: [clinics.id]
	}),
	patient: one(patients, {
		fields: [documents.patientId],
		references: [patients.id]
	}),
	doctor: one(doctors, {
		fields: [documents.doctorId],
		references: [doctors.id]
	}),
	appointment: one(appointments, {
		fields: [documents.appointmentId],
		references: [appointments.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	clinic: one(clinics, {
		fields: [transactions.clinicId],
		references: [clinics.id]
	}),
	appointment: one(appointments, {
		fields: [transactions.appointmentId],
		references: [appointments.id]
	}),
}));

export const financialReportsRelations = relations(financialReports, ({one}) => ({
	clinic: one(clinics, {
		fields: [financialReports.clinicId],
		references: [clinics.id]
	}),
}));

export const payablesRelations = relations(payables, ({one}) => ({
	clinic: one(clinics, {
		fields: [payables.clinicId],
		references: [clinics.id]
	}),
}));

export const documentTemplatesRelations = relations(documentTemplates, ({one}) => ({
	clinic: one(clinics, {
		fields: [documentTemplates.clinicId],
		references: [clinics.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
	clinic: one(clinics, {
		fields: [notifications.clinicId],
		references: [clinics.id]
	}),
}));