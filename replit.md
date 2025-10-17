# APDO HABITAT - Housing Management System

## Overview

APDO HABITAT is a multi-tenant SaaS platform designed for the staffing agency industry to manage worker accommodation. Its primary purpose is to provide a professional, data-dense interface for real-time tracking of houses, rooms, and bed availability, managing worker assignments, and handling reservations efficiently. The system focuses on visualizing housing capacity, incorporating color-coded status indicators, and detecting potential gender conflicts within accommodations. It targets B2B staffing agencies managing multiple housing properties across various locations.

## User Preferences

Preferred communication style: Simple, everyday language.
All UI text must be in Turkish language.

## System Architecture

### Technology Stack

**Frontend**: React 18 with TypeScript, Vite, TanStack Query, Wouter, Tailwind CSS with shadcn/ui, Inter font.
**Backend**: Node.js with Express, TypeScript, JWT-based authentication, bcrypt for password hashing, connect-pg-simple for session management.
**Database & ORM**: PostgreSQL, Neon Database serverless client, Drizzle ORM.

### Design System

The UI/UX adopts a modern SaaS design inspired by Vercel, Linear, and Stripe, emphasizing clarity, whitespace, and data hierarchy (houses → rooms → beds). It uses a fixed color-coded status system for bed availability (Red for empty, Green for occupied, Purple for reserved, Amber for out of service) and distinct blue/pink indicators for gender on bed cards.

### Multi-Tenancy Architecture

The system enforces tenant isolation where all data entities are scoped by `tenantId`. User authentication is tied to a specific tenant, and row-level security is applied at the application layer. Authentication uses JWT tokens containing `userId`, `tenantId`, and `email`, stored in localStorage and included in API requests.

### Database Schema Design

The core hierarchy includes Tenants, Users, Houses, Rooms, Beds, Workers, and Reservations. Key entities are designed to manage physical properties, individual sleeping units, worker information, and time-bound bed assignments. Critical fields include ownership types, bed statuses, gender restrictions, and room types.

### API Structure

The API includes endpoints for authentication, managing houses, workers, and reservations. Future implementations will include comprehensive QR code management for task delegation and submission approvals. All authenticated endpoints require a JWT token for authorization.

### Business Logic Components

Key business logic includes gender conflict detection within rooms, real-time capacity calculations for bed occupancy, and date-based filtering for reservations and bed status.

### State Management Strategy

TanStack Query is used for server state management (caching, refetching). React's `useState` and Context are used for client-side state (authentication, UI modals, form inputs). Local Storage persists JWT tokens and user data for session restoration.

### Features

- **Accommodation Billing & Assignment Management**: The "Konaklama" (Accommodation) module manages worker-bed assignments, automatically calculates monthly charges (prorated for partial months), tracks deposits, and monitors payment statuses. It includes a statistics dashboard and risk-based warnings.
- **Multi-Level Pricing System**: Supports a 3-level pricing hierarchy (Room-specific > House-specific > Standard system pricing) with a global daily rental mode toggle. Calculations adapt for daily or monthly rates based on duration.
- **House Archiving System**: Implements soft-delete for houses with visual indicators (opacity, dashed border, "Arşiv" badge) and a toggle to show/hide archived houses.
- **QR Code Task Delegation System**: Enables creation of unique public QR links for worker self-registration, meter readings, and document uploads. Features include configurable usage limits, expiry dates, status management, and a pending approvals queue with notifications.
- **Check-in/Check-out System**: Manages worker statuses (e.g., `new_registration`, `checked_out`) and tracks check-in/out dates, key handover, and return dates.

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