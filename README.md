# Healthcare Backend API

A Node.js backend system for healthcare applications with JWT authentication and PostgreSQL database.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Install PostgreSQL
   - Create a database named `healthcare_db`
   - Update `.env` file with your database credentials

3. **Environment Configuration**
   Update `.env` file with your settings:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=healthcare_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   ```

4. **Start Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Patients (Authenticated)
- `POST /api/patients/` - Add patient
- `GET /api/patients/` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `POST /api/doctors/` - Add doctor (Authenticated)
- `GET /api/doctors/` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor (Authenticated)
- `DELETE /api/doctors/:id` - Delete doctor (Authenticated)

### Patient-Doctor Mappings (Authenticated)
- `POST /api/mappings/` - Assign doctor to patient
- `GET /api/mappings/` - Get all mappings
- `GET /api/mappings/:patient_id` - Get doctors for patient
- `DELETE /api/mappings/:id` - Remove doctor from patient

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```