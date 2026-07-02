# FactEntry Backend REST API

This directory contains the Spring Boot application driving the backend REST services, JPA repositories, database mappings, JWT authentication, and file storage for the **FactEntry Platform**.

---

## Technical Stack Overview

* **Core Framework**: [Spring Boot v3.4.1](https://spring.io/projects/spring-boot) (Java 17+).
* **Database Access**: Spring Data JPA using [Hibernate ORM](https://hibernate.org/).
* **Security & Auth**: Spring Security with stateless **JSON Web Token (JWT)** filters.
* **Database Profile**:
  - H2 Database (In-Memory profile default for local testing).
  - PostgreSQL drivers included for production environments.
* **Document Exports**:
  - [Apache POI v5](https://poi.apache.org/) (Excel spreadsheet generation).
  - [OpenPDF](https://github.com/LibrePDF/OpenPDF) (PDF document generation).
* **Code Utility**: Lombok for boilerplate reduction (Getters, Setters, Builders).

---

## Java Package Architecture

All source code is organized under `src/main/java/com/queryplatform/backend`:

```text
/backend/src/main/java/com/queryplatform/backend
├── config/              # Security configurations & database seeding engines
├── controller/          # REST Endpoint controllers exposing JSON endpoints
├── dto/                 # Request/Response Data Transfer Objects & ModelMapper
├── entity/              # JPA Database entity models
├── exception/           # Global error handler and custom exception classes
├── repository/          # Database query adapters and custom SQL query hooks
├── security/            # JWT token validation Filters and User details managers
├── service/             # Core business logic handlers & file processors
└── BackendApplication   # Entrypoint boots Spring Context
```

---

## 1. Security & Authentication (`config` & `security`)
* **[SecurityConfig.java](file:///d:/Raghul/FactEntry/backend/src/main/java/com/queryplatform/backend/config/SecurityConfig.java)**:
  - Disables CSRF for statelessness.
  - Implements CORS rules to allow requests from the React client on `http://localhost:5173`.
  - Configures route-level access rules:
    - Public: `/api/auth/login`, `/h2-console/**`.
    - Admin-restricted: `/api/admin/**`.
    - Authenticated: All other `/api/**` paths.
* **[JwtAuthenticationFilter.java](file:///d:/Raghul/FactEntry/backend/src/main/java/com/queryplatform/backend/security/JwtAuthenticationFilter.java)**:
  - Extracts JWT token from the `Authorization: Bearer <token>` request header.
  - Validates signatures and injects authentication tokens into the Spring Security Context.

---

## 2. Database Entities (`entity`)
* **`User`**: Account model (Name, Email, Role: `ANALYST`, `SME`, `ADMIN`, password hash).
* **`Query`**: Primary operational query log (Subject, details, status, critical flag, assigned SME, creator, tags).
* **`Comment`**: Resolution thread comment logs linked to specific queries.
* **`Attachment`**: File references (Filename, disk path, query ID link).
* **`AuditLog`**: Model recording exact database columns changed, original values, new values, actors, and times.
* **`Notification`**: System alert messages.

---

## 3. Custom Database Querying (`repository`)
* **[QueryRepositoryCustomImpl.java](file:///d:/Raghul/FactEntry/backend/src/main/java/com/queryplatform/backend/repository/QueryRepositoryCustomImpl.java)**:
  - Implements custom natural language similarity checks to prevent duplicate queries.
  - In a standard database (PostgreSQL), it queries using `pg_trgm` similarity scores.
  - Falls back to database string checks inside the in-memory H2 profile.

---

## 4. Reports & Exports Service (`service`)
* **[ExportService.java](file:///d:/Raghul/FactEntry/backend/src/main/java/com/queryplatform/backend/service/ExportService.java)**:
  - **Excel Export**: Uses Apache POI's `SXSSFWorkbook` to stream large dataset exports to spreadsheets.
  - **PDF Export**: Generates landscape PDF files with tables showing dates, subjects, creators, assignees, and states.
