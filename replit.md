# ARPDO HABITAT - Housing Management System

## Overview

ARPDO HABITAT is a multi-tenant SaaS platform for staffing agencies, designed to manage worker accommodation efficiently. It provides a data-dense interface for real-time tracking of housing, room, and bed availability, worker assignments, and reservations. Key capabilities include visualizing housing capacity with color-coded status indicators and detecting gender conflicts. The system aims to streamline accommodation management for B2B staffing agencies operating across multiple locations.

## User Preferences

Preferred communication style: Simple, everyday language.
All UI text must be in Turkish language.

## System Architecture

### Technology Stack

**Frontend**: React 18 (TypeScript, Vite, TanStack Query, Wouter, Tailwind CSS with shadcn/ui).
**Backend**: Node.js with Express and TypeScript, JWT authentication, bcrypt, connect-pg-simple.
**Database**: PostgreSQL via Neon Database (serverless), Drizzle ORM.
**Storage**: PostgreSQL always-on (DbStorage with auto-seed mock data).

### Design System

The UI/UX is inspired by modern SaaS platforms like Vercel, Linear, and Stripe, focusing on clarity and data hierarchy (houses → rooms → beds). It uses a fixed color-coded status for bed availability (Red: empty, Green: occupied, Purple: reserved, Amber: out of service) and gender indicators (blue/pink).

### Multi-Tenancy Architecture

All data is scoped by `tenantId` with user authentication tied to a specific tenant. Row-level security is enforced at the application layer. JWT tokens contain `userId`, `tenantId`, and `email` for authentication.

### Database Schema Design

A federated worker identity model uses three tables:
- `worker_profiles`: Global, worker-owned identity data (e.g., email, name, gender).
- `employments`: Tenant-specific employment details (e.g., status, dates, job title).
- `employment_private_data`: Tenant-specific, sensitive employment data (e.g., salary, contract details).

Core entities include Tenants, Users, Houses, Rooms, Beds, and Reservations, with reservations linking to `employmentId`.

### API Structure

The API includes endpoints for authentication, managing houses, workers, and reservations, requiring JWT tokens for authorized access.

### Business Logic

Key logic includes gender conflict detection, real-time bed occupancy calculations, and date-based filtering for reservations.

### State Management

TanStack Query manages server state (caching, refetching). React's `useState` and Context manage client-side state. Local Storage persists JWT tokens and user data.

### Features

-   **Workers Management (Federated Model)**: Displays workers with employment details, allowing creation, editing (of employment-specific fields), search, and filtering. Supports configurable pagination and status badges.
-   **Currency Settings**: Tenant admins can configure system-wide currency from a list of 20 major currencies.
-   **Accommodation Billing & Assignment Management**: Manages worker-bed assignments, calculates prorated monthly charges, tracks deposits, and monitors payment statuses with advanced filtering for overdue categories. Features enhanced dashboard statistics with 3 new cards: Upcoming Due Dates (today/3-day/7-day breakdown with mutually exclusive date buckets), Overdue Breakdown (4 color-coded severity levels: 1-7, 8-14, 15-30, 30+ days), and Deposits to Refund (7-day checkout tracking). Full i18n support across 7 languages.
-   **Multi-Level Pricing System**: Supports a 3-level pricing hierarchy (Room > House > System) with a global daily rental mode toggle.
-   **House Archiving System**: Implements soft-delete for houses with visual indicators and a toggle to show/hide archived houses.
-   **QR Code Task Delegation System**: Enables creation of unique QR links for worker self-registration, meter readings, and document uploads, with usage limits, expiry dates, and an approvals queue.
-   **Check-in/Check-out System**: A 4-step wizard for worker bed assignments with real-time dashboard updates, type-ahead filtering in dropdowns, date pickers, and instant occupancy updates. The system is fully internationalized across 7 languages.
-   **Centralized Country Management System**: Provides a SaaS-level countries database with 30+ translated countries. Tenants can select favorite and default countries, influencing display order in dropdowns. Supports dynamic localization.

## External Dependencies

### Third-Party Services

-   **Database**: Neon Database (Serverless PostgreSQL).
-   **Authentication**: `jsonwebtoken`, `bcryptjs`.

### UI Component Libraries

-   **shadcn/ui**: Built on Radix UI primitives, styled with Tailwind CSS.
-   **Icons**: Lucide React.

### Data Fetching

-   **TanStack Query**: For server state management.
-   **Fetch API**: Native browser API for HTTP requests.

## Database Setup

### PostgreSQL Configuration
- **Storage Mode**: DbStorage (PostgreSQL) always-on for persistent data
- **Auto-Seed**: Mock data automatically loads on first application start
- **Mock Data**: 30 countries, 2 platform admins, 3 tenants, 7 users, 12 worker profiles

### Fresh Database Setup
To initialize a fresh PostgreSQL database with schema and mock data:
```bash
psql "$DATABASE_URL" < init-db.sql
```

This creates:
- 12 tables (countries, platform_admins, tenants, users, worker_profiles, employments, employment_private_data, houses, rooms, beds, reservations, user_preferences)
- 16 enum types
- All constraints and indexes
- Complete mock/demo data

### Files
- **init-db.sql** (933 lines): Full database export with schema + mock data
- **DATABASE_SETUP.md**: Detailed setup instructions and database documentation

### Schema Updates
1. Edit `shared/schema.ts`
2. Run `npm run db:push --force` to sync changes
3. Export updated SQL: `pg_dump "$DATABASE_URL" --clean --if-exists --no-owner --no-acl > init-db.sql`