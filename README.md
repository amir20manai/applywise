# ApplyWise

A web app to follow a job search from the first application to the offer. Candidates keep their CVs, applications, interviews and reminders in one place. Admins publish companies and job offers. An AI assistant helps write cover letters, follow-up emails and interview preparation.

## Features

**Candidates**
- Register and sign in (JWT authentication)
- Upload and manage CVs (PDF, DOC, DOCX), choose a default one, download them
- Browse and search job offers, apply in one click with the default CV
- Track applications by status (pending, applied, under review, interview, accepted, rejected, withdrawn)
- Add applications found on other sites, edit notes and cover letters
- Plan interviews with date, place and meeting link
- Notifications when an application changes status, and a reminder 24 hours before an interview
- Dashboard with totals, a status breakdown, upcoming interviews and recent applications
- Profile and password management

**Admins**
- Manage companies
- Publish, edit and delete job offers

**AI assistant (Google Gemini)**
- Cover letter written from the job and the candidate's highlights
- Follow-up or thank-you email for an application
- Interview preparation: likely questions, questions to ask, tips
- Summary of a job offer (skills, missing information)
- Job offer description for admins

Only the name, the job details and the text typed by the user are sent to the AI. The CV file, email address and phone number are never sent.

## Tech stack

| Part | Technology |
|---|---|
| Backend | Java 25, Spring Boot 4, Spring Security, Spring Data JPA (Hibernate), Maven |
| Database | MySQL |
| Auth | JWT (jjwt), BCrypt |
| Frontend | Angular 22 (standalone components, signals, reactive forms), TypeScript |
| AI | Google Gemini API |

## Project structure

```
ApplyWise/
  backend/     Spring Boot REST API (controller, service, repository, entity, dto, security, ai)
  frontend/    Angular application
```

## Getting started

### Prerequisites

- Java 25 and Maven
- Node.js 20.19 or later and Angular CLI (`npm install -g @angular/cli`)
- MySQL (for example through XAMPP)

### 1. Database

Start MySQL. The database `applywise_db` is created automatically at the first start. The tables are created by Hibernate (`ddl-auto=update`).

The default connection in `backend/src/main/resources/application.properties` is `root` with an empty password. Change it for your machine, and never commit a real password.

### 2. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | Yes | Secret used to sign tokens. A Base64 string of at least 32 bytes |
| `GEMINI_API_KEY` | No | Enables the AI features. Get a key from Google AI Studio |

Generate a secret on Windows (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Set the variables (Windows), then open a new terminal:

```
setx JWT_SECRET "your_generated_secret"
setx GEMINI_API_KEY "your_gemini_key"
```

On macOS or Linux use `export JWT_SECRET=...` instead.

Without `GEMINI_API_KEY` the app works normally and the AI buttons answer that AI is not configured.

### 3. Run the backend

```
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

### 4. Run the frontend

```
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`.

### 5. Create an admin account

New accounts are always candidates. Register in the app, then promote the account in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

Sign out and sign in again so the new role is loaded.

## AI configuration

The model name is a setting, not code. In `application.properties`:

```properties
application.ai.model=gemini-3.5-flash-lite
```

Models change over time. If the AI answers with an error about the model, list the available ones and update this line:

```
curl "https://generativelanguage.googleapis.com/v1beta/models" -H "x-goog-api-key: YOUR_KEY"
```

On the free tier, Google may use the requests to improve its products and limits apply.

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Profile | `GET/PUT /api/profile`, `PUT /api/profile/password` |
| CVs | `GET/POST /api/resumes`, `PUT /api/resumes/{id}/default`, `GET /api/resumes/{id}/download`, `DELETE /api/resumes/{id}` |
| Companies | `GET /api/companies` (all users), `POST/PUT/DELETE` (admin) |
| Job offers | `GET /api/job-offers` (all users), `POST/PUT/DELETE` (admin) |
| Applications | `GET/POST /api/applications`, `GET/PUT/DELETE /api/applications/{id}`, `PATCH /api/applications/{id}/status` |
| Interviews | `GET /api/interviews`, `POST /api/applications/{id}/interviews`, `PUT/DELETE /api/interviews/{id}`, `PATCH /api/interviews/{id}/status` |
| Notifications | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all`, `DELETE /api/notifications/{id}` |
| Dashboard | `GET /api/dashboard` |
| AI | `POST /api/ai/cover-letter`, `POST /api/ai/applications/{id}/follow-up`, `POST /api/ai/interviews/{id}/prepare`, `POST /api/ai/job-offers/{id}/summary`, `POST /api/ai/offer-description` (admin) |

All endpoints except `/api/auth/**` need the header `Authorization: Bearer <token>`.

## Security notes

- Passwords are hashed with BCrypt. The JWT secret and the AI key come from environment variables and are not in the repository.
- Every resource (CV, application, interview, notification) is checked against the signed-in user. Asking for someone else's resource returns 404.
- Admin routes are protected twice: in the Angular router and in Spring Security.
- Uploaded files are renamed with a random name, limited to PDF, DOC and DOCX, and limited to 5 MB. The `uploads/` folder is ignored by Git.

## Roadmap

- Pagination for long lists
- Edit interviews (date, place, notes)
- Tests for the backend services
- Deployment
