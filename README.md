# School Admissions Portal

A React + Next.js admissions portal with MySQL support for student registration, document uploads, and admissions administration.

## Features

- Student online registration form
- Parent/guardian information capture
- Class selection and status tracking
- Automatic application number generation
- Document upload and retrieval
- Admissions dashboard with search, filters, and approval workflow

## Setup

1. Install dependencies:

   ```bash
   cd school-admissions
   npm install
   ```

2. Create a MySQL database and tables:

   ```sql
   CREATE DATABASE school_admissions;
   USE school_admissions;

   CREATE TABLE applications (
     id INT AUTO_INCREMENT PRIMARY KEY,
     application_number VARCHAR(32) NOT NULL UNIQUE,
     first_name VARCHAR(120) NOT NULL,
     last_name VARCHAR(120) NOT NULL,
     date_of_birth DATE NOT NULL,
     gender VARCHAR(24) NOT NULL,
     grade VARCHAR(24) NOT NULL,
     parent_name VARCHAR(120) NOT NULL,
     parent_phone VARCHAR(32) NOT NULL,
     parent_email VARCHAR(120) NOT NULL,
     address TEXT NOT NULL,
     status VARCHAR(24) NOT NULL DEFAULT 'Pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE documents (
     id INT AUTO_INCREMENT PRIMARY KEY,
     application_id INT NOT NULL,
     document_type VARCHAR(64) NOT NULL,
     file_name VARCHAR(255) NOT NULL,
     file_url VARCHAR(512) NOT NULL,
     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
   );

   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(24) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Add environment variables in `.env.local`:

   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=school_admissions
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

## Notes

- The backend is implemented with Next.js API routes in `src/app/api`.
- Document upload endpoints store metadata and can be extended to support real file storage.
- Use the admissions dashboard to approve, reject, and print admission letters.
