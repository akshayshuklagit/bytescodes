-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE healthcare_db;

-- Connect to healthcare_db and run the following:

-- Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS "Patients" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS "Doctors" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "specialization" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "experience" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- PatientDoctors table (junction table)
CREATE TABLE IF NOT EXISTS "PatientDoctors" (
    "id" SERIAL PRIMARY KEY,
    "patientId" INTEGER NOT NULL REFERENCES "Patients"("id") ON DELETE CASCADE,
    "doctorId" INTEGER NOT NULL REFERENCES "Doctors"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("patientId", "doctorId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "patients_user_id" ON "Patients"("userId");
CREATE INDEX IF NOT EXISTS "patient_doctors_patient_id" ON "PatientDoctors"("patientId");
CREATE INDEX IF NOT EXISTS "patient_doctors_doctor_id" ON "PatientDoctors"("doctorId");