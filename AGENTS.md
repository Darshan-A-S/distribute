# AGENTS.md

Read this at the start of every session. This is the source of truth for the project.

## What This Is

A localhost-only web app for generating personalized PDF certificates and emailing them in batches to recipients uploaded via Excel. Multi-tenant — every entity scoped to the authenticated user.

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Backend | Spring Boot, Java 17 | 3.3.4 |
| Frontend | React, Vite, Tailwind CSS | 18 / 5 / 3.4 |
| Database | PostgreSQL | 18 (local) |
| Auth | Session-based (JSESSIONID), BCrypt | — |
| ORM | Hibernate (ddl-auto=update) | — |

No JWT. No Docker. No CI.

## Running Locally

- **Backend:** `cd backend && mvn spring-boot:run` → `localhost:8080`
- **Frontend:** `cd client && npm run dev` → `localhost:5173`
- Vite proxies `/api` → `localhost:8080`
- Default admin: `admin` / `admin123` (seeded on startup)

## Project Layout

```
sender/
├── backend/              Spring Boot app
│   ├── src/main/java/com/sender/
│   │   ├── config/       SecurityConfig, CorsConfig, Seeder
│   │   ├── controller/   REST endpoints under /api
│   │   ├── dto/          Java records for requests/responses
│   │   ├── exception/    GlobalExceptionHandler, NotFoundException
│   │   ├── model/        JPA entities (UserAccount, EmailTemplate, Recipient, SendJob)
│   │   ├── repository/   Spring Data JPA interfaces
│   │   └── service/      Business logic
│   └── src/main/resources/application.properties
└── client/               React SPA
    └── src/
        ├── api/api.js    Fetch wrapper (credentials: include, 401→/login)
        ├── context/      AuthContext (auth state via React Context)
        ├── components/   Layout, TemplateForm, CertificateEditor, etc.
        └── pages/        Templates, Recipients, Send, Settings, AdminUsers, Login
```

## Backend Conventions

- **Entities:** Lombok `@Data @Builder @NoArgsConstructor @AllArgsConstructor`. UserAccount implements `UserDetails` directly.
- **DTOs:** Java records (`AuthRequest`, `UserDto`, `ProfileRequest`, etc.). UserDto never leaks passwords.
- **Ownership:** Flat `ownerId` field on entities, not JPA `@ManyToOne`. Always filter queries by authenticated user.
- **Error responses:** Uniform `{"error": "..."}` shape. Thrown as `RuntimeException`, caught by `GlobalExceptionHandler`.
- **Email sending:** Per-user SMTP (each user stores their own SMTP creds in UserAccount). `EmailService` builds a `JavaMailSenderImpl` per user. System emails (password reset, OTP) use the global `JavaMailSender` from application.properties.
- **Async:** `@Async` on batch send (`SenderApplication` has `@EnableAsync`).
- **Tests:** Only `CertificateServiceTest`. Run `mvn test`.

## Frontend Conventions

- **Styling:** Tailwind utility classes. Custom component classes in `index.css`: `card`, `btn-primary`, `btn-secondary`, `btn-danger`, `input`, `label`, `icon-btn`, `badge`, `page-title`.
- **Theme:** Dark slate-950 background, teal/green accent palette (custom in tailwind.config.js), Inter font.
- **State:** React Context only (no Redux, no Zustand). `AuthContext` for auth state.
- **API calls:** All through `api/api.js` fetch wrapper. Always `credentials: 'include'`.
- **Routes:** `/` public landing, `/login`, then guarded `/app` (Templates), `/app/recipients`, `/app/send`, `/app/settings`, `/app/admin/users`.

## API Endpoints

All under `/api`. Session auth — 401 if not logged in.

| Group | Endpoints | Auth |
|-------|-----------|------|
| Auth | register, login, logout, me | Public |
| Auth | settings (PUT), change-password (PUT) | User |
| Auth | forgot-password, reset-password | Public |
| Auth | send-verification, verify-email | User |
| Templates | CRUD, library browse | User |
| Templates | library publish/edit/delete, template publish | Admin |
| Recipients | upload, preview, batches, stats, delete, reset | User |
| Send | trigger, status, recent | User |
| Admin | users list, delete, set-role | Admin |

## Key Gotchas

- `application.properties` is gitignored. `application.properties.example` is the template.
- SMTP creds are per-user in the DB. The global `spring.mail.*` config is only for system emails (reset, OTP).
- `ddl-auto=update` — Hibernate auto-migrates schema. Never manually alter columns without checking entity fields.
- CSRF is disabled (localhost dev tool). Re-enable before exposing beyond localhost.
- Backend seed: auto-creates `admin/admin123` on startup if missing.
- No rate limiting anywhere. No email template styling for system emails.
- `backend/data/senderdb.mv.db` is a leftover H2 file from before PostgreSQL. Ignore it.

## Password / Auth Flows

- **Change password:** Authenticated, requires current password + new password.
- **Forgot password:** Public, sends reset link to email (token expires 1 hour).
- **Reset password:** Public, takes token from email + new password.
- **Email verification:** Authenticated, sends 6-digit OTP to profile email (expires 15 min). `emailVerified` flag on UserAccount.

## When Modifying Code

1. Read the file you're about to change plus its imports/neighbors.
2. Follow existing patterns — don't introduce new libraries or abstractions without need.
3. Keep error responses as `{"error": "message"}`.
4. Keep ownership scoping (filter by user) on all queries.
5. Run `mvn compile` in `backend/` to verify backend changes.
6. Frontend has no type checking or lint command — just `npm run build` to verify.
