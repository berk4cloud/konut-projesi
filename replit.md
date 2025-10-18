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
**Storage**: Hybrid MemStorage (development) and DbStorage (production).

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
-   **Accommodation Billing & Assignment Management**: Manages worker-bed assignments, calculates prorated monthly charges, tracks deposits, and monitors payment statuses with advanced filtering for overdue categories.
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