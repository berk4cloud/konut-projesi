# ARPDO HABITAT - Housing Management System

## Overview

ARPDO HABITAT is a multi-tenant SaaS platform designed for the staffing agency industry to manage worker accommodation. Its primary purpose is to provide a professional, data-dense interface for real-time tracking of houses, rooms, and bed availability, managing worker assignments, and handling reservations efficiently. The system focuses on visualizing housing capacity, incorporating color-coded status indicators, and detecting potential gender conflicts within accommodations. It targets B2B staffing agencies managing multiple housing properties across various locations.

## User Preferences

Preferred communication style: Simple, everyday language.
All UI text must be in Turkish language.

## System Architecture

### Technology Stack

**Frontend**: React 18 with TypeScript, Vite, TanStack Query, Wouter, Tailwind CSS with shadcn/ui, Inter font.
**Backend**: Node.js with Express, TypeScript, JWT-based authentication, bcrypt for password hashing, connect-pg-simple for session management.
**Database & ORM**: PostgreSQL, Neon Database serverless client, Drizzle ORM.
**Storage Layer**: Hybrid storage architecture - MemStorage (development) for fast iteration, DbStorage (production) for persistent data. Environment-based switching via NODE_ENV.

### Design System

The UI/UX adopts a modern SaaS design inspired by Vercel, Linear, and Stripe, emphasizing clarity, whitespace, and data hierarchy (houses → rooms → beds). It uses a fixed color-coded status system for bed availability (Red for empty, Green for occupied, Purple for reserved, Amber for out of service) and distinct blue/pink indicators for gender on bed cards.

### Multi-Tenancy Architecture

The system enforces tenant isolation where all data entities are scoped by `tenantId`. User authentication is tied to a specific tenant, and row-level security is applied at the application layer. Authentication uses JWT tokens containing `userId`, `tenantId`, and `email`, stored in localStorage and included in API requests.

### Database Schema Design

**Federated Worker Identity Model**: The system uses a three-table worker architecture separating portable identity from employment data:

- **worker_profiles** (Global, worker-owned): Email, name, gender, nationality, photo, bio. Portable across tenants, enables workers to work for multiple companies simultaneously.
- **employments** (Tenant-specific, links worker to company): Status (active/inactive/former/invited), start/end dates, snapshot fields (gender/photo/name preserved when worker leaves), job title, department.
- **employment_private_data** (Tenant-specific, sensitive): Salary, contract details, performance ratings, internal notes. Never shared across tenants, isolated per employment.

The core physical hierarchy includes Tenants, Users, Houses, Rooms, Beds, and Reservations. Reservations reference `employmentId` (not workerId) to tie accommodations to specific tenant-worker relationships. Key entities include ownership types, bed statuses, gender restrictions, and room types.

### API Structure

The API includes endpoints for authentication, managing houses, workers, and reservations. Future implementations will include comprehensive QR code management for task delegation and submission approvals. All authenticated endpoints require a JWT token for authorization.

### Business Logic Components

Key business logic includes gender conflict detection within rooms, real-time capacity calculations for bed occupancy, and date-based filtering for reservations and bed status.

### State Management Strategy

TanStack Query is used for server state management (caching, refetching). React's `useState` and Context are used for client-side state (authentication, UI modals, form inputs). Local Storage persists JWT tokens and user data for session restoration.

### Features

- **Workers Management (Federated Model)**: The Workers page displays all workers with their employment details using the federated model. Workers are fetched via GET `/api/workers` which joins worker_profiles, employments, and employment_private_data tables. Features include:
  - **Add Worker**: Creates worker profile + employment + private data in one transaction via POST `/api/workers`. Form includes: firstName, lastName, dateOfBirth (optional), gender (male/female), nationality (optional), email, phone (optional), jobTitle, department, startDate. Empty strings are normalized to null before saving.
  - **Edit Worker**: Updates employment via PATCH `/api/employments/:id`. Updates job title, department, and other employment-specific fields.
  - **Search & Filter**: Real-time search across name, nationality, job title, department, email, and phone.
  - **Employment Status Badges**: Color-coded badges for active (green), inactive (gray), former (red with end date), invited (purple).
  - **Pagination**: Configurable page size (10/25/50/100 workers per page).
  - **Field Mappings**: birthDate → dateOfBirth, country → nationality, gender: "Erkek"/"Kadın" (Turkish) → "male"/"female" (API).
- **Currency Settings**: Tenant admins can configure system-wide currency from Settings page. Supports 20 major currencies: EUR, USD, GBP, CHF, CAD, MXN, CNY, JPY, TRY, RUB, SEK, NOK, DKK, HUF, PLN, CZK, RON, BGN, RSD, UAH. Currency persists in localStorage via systemSettings and applies to all pricing displays. Schema includes currency enum and field on tenants table with EUR as default.
- **Accommodation Billing & Assignment Management**: The "Konaklama" (Accommodation) module manages worker-bed assignments, automatically calculates monthly charges (prorated for partial months), tracks deposits, and monitors payment statuses. Includes enhanced filtering with granular overdue categories (7-14 days, 14-30 days, 30-90 days, 90+ days), worker-grouped payment history with expandable records, and date range filtering for payment queries.
- **Multi-Level Pricing System**: Supports a 3-level pricing hierarchy (Room-specific > House-specific > Standard system pricing) with a global daily rental mode toggle. Calculations adapt for daily or monthly rates based on duration.
- **House Archiving System**: Implements soft-delete for houses with visual indicators (opacity, dashed border, "Arşiv" badge) and a toggle to show/hide archived houses.
- **QR Code Task Delegation System**: Enables creation of unique public QR links for worker self-registration, meter readings, and document uploads. Features include configurable usage limits, expiry dates, status management, and a pending approvals queue with notifications.
- **Check-in/Check-out System**: 4-step wizard managing worker bed assignments with real-time dashboard updates. All dropdowns use SearchCombobox (Command + Popover) for type-ahead filtering. Date pickers include "Bugün" (Today) button and validation. Auto-populates deposit collector with logged-in user. Updates bed occupancy, capacity counters, and worker assignments instantly upon completion. **Fully internationalized** across all 7 languages (TR, EN, DE, NL, FR, PL, BG) using line-based translation keys for multi-line step labels, ensuring native phrasing without hardcoded separators.
- **Centralized Country Management System**: Implements SaaS-level countries database with 30+ countries translated across all 7 supported languages (TR, EN, DE, NL, FR, PL, BG). Tenants can select favorite countries and set a default country from Settings. Country dropdowns throughout the system (Houses, etc.) display prioritized lists: default country first, then favorites alphabetically, then all others alphabetically. Dynamic localization ensures country names update when language changes. Backend provides GET `/api/countries` and tenant preferences via PATCH `/api/tenants/:id`. Implementation uses useMemo for performance optimization and proper i18n locale normalization (en-US → en). Command component uses `shouldFilter={false}` to preserve custom sorting.

## External Dependencies

### Third-Party Services

- **Database**: Neon Database (Serverless PostgreSQL)
- **Authentication**: `jsonwebtoken` for JWT, `bcryptjs` for password hashing.

### UI Component Libraries

- **shadcn/ui Components**: Utilizes Radix UI primitives for dialogs, dropdowns, forms, and layout components, all styled with Tailwind CSS.
- **Icons**: Lucide React for various icons.

### Data Fetching

- **TanStack Query**: Used for robust server state management, caching, and invalidation.
- **Fetch API**: Native browser Fetch API is used for HTTP requests, wrapped with custom logic for authentication and error handling.

### Development Tools

- **Replit-Specific**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.
- **Build Tools**: Vite (frontend), esbuild (backend), tsx (development TypeScript execution), drizzle-kit (database migrations).

---

## 🎯 VISION DOCUMENT - Future Roadmap

### Current State: Phase 1 (Implemented ✅)

**Federated Worker Identity Model** - Data Architecture Layer
- ✅ 3-table architecture: worker_profiles, employments, employment_private_data
- ✅ Workers can work for multiple tenants simultaneously
- ✅ Data ownership separation (worker owns profile, tenant owns employment)
- ✅ Backend API: POST /api/workers, GET /api/workers, PATCH /api/employments/:id
- ✅ Mock data: 12 complete federated worker records
- ✅ Basic user roles: admin, office_staff, field_staff

**Important Distinction:**
- **Federated Worker Identity Model** = Data architecture for portable worker identity
- **RBAC (Role-Based Access Control)** = Authorization system (future implementation)
- These are **separate but complementary** systems

### Future Phases: Enterprise RBAC System

**Phase 2: Tenant-Level Roles** (8 types)
- Tenant Owner
- Tenant Admin
- HR Manager
- Planner / Scheduler
- Accommodation Manager
- Transport Manager
- Finance / Accounting
- Viewer (Read-only)

**Phase 3: Worker-Level Permissions** (4 types)
- Active Worker
- Inactive Worker
- Former Worker
- Invited Worker

**Phase 4: Platform & Employer Levels** (8 + 3 types)

*Platform Level (5 types):*
- Platform Super Admin
- Platform Admin
- Platform Support Staff
- Platform Analyst
- Platform Developer

*Employer Level (3 types - for Staffing Agency model):*
- Employer Admin
- Employer Manager
- Employer Viewer

**Phase 5: Specialized Roles** (3 + 2 types)

*Special Access (3 types):*
- External Auditor
- API User
- Emergency Contact

*Driver Module (2 types - when transport module is active):*
- Active Driver
- Driver App User

### Total Planned Role Types: 25

This granular RBAC system will be implemented modularly as the platform grows. Each phase builds upon the previous, ensuring stable incremental development while maintaining the foundational Federated Worker Identity Model as the data layer.