-- Migration: Add performance indexes for frequently queried columns
-- Created: 2025-10-10
-- Purpose: Improve query performance by adding indexes on commonly filtered columns

-- Appointments table indexes (CRITICAL)
-- For filtering appointments by doctor and date (used in getAvailableTimes)
CREATE INDEX IF NOT EXISTS "idx_appointments_doctor_date" ON "appointments" ("doctor_id", "date");

-- For filtering appointments by clinic and date (used in dashboard)
CREATE INDEX IF NOT EXISTS "idx_appointments_clinic_date" ON "appointments" ("clinic_id", "date");

-- For filtering appointments by patient
CREATE INDEX IF NOT EXISTS "idx_appointments_patient" ON "appointments" ("patient_id");

-- Documents table indexes (HIGH PRIORITY)
-- For filtering documents by clinic and doctor
CREATE INDEX IF NOT EXISTS "idx_documents_clinic_doctor" ON "documents" ("clinic_id", "doctor_id");

-- For filtering documents by clinic with date ordering
CREATE INDEX IF NOT EXISTS "idx_documents_clinic_created" ON "documents" ("clinic_id", "created_at" DESC);

-- Patients table indexes (HIGH PRIORITY)
-- For filtering patients by clinic
CREATE INDEX IF NOT EXISTS "idx_patients_clinic" ON "patients" ("clinic_id", "name");

-- Doctors table indexes (HIGH PRIORITY)
-- For filtering doctors by clinic
CREATE INDEX IF NOT EXISTS "idx_doctors_clinic" ON "doctors" ("clinic_id", "name");

-- For finding doctor by userId (used frequently in auth - CRITICAL)
CREATE INDEX IF NOT EXISTS "idx_doctors_user_id" ON "doctors" ("user_id");

-- Sessions table index (for session lookup - CRITICAL)
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" ("user_id");

-- Users to clinics table index (CRITICAL for auth)
CREATE INDEX IF NOT EXISTS "idx_users_clinics_user" ON "users_to_clinics" ("user_id");

