# APDO HABITAT - Housing Management System

## Overview

APDO HABITAT is a multi-tenant SaaS platform for managing worker accommodation in the staffing agency industry. The system enables staffing companies to track houses, rooms, and bed availability in real-time, manage worker assignments, and handle reservations efficiently.

**Core Purpose**: Provide a professional, data-dense interface for managing workforce housing capacity with real-time bed availability tracking, color-coded status visualization, and gender conflict detection.

**Target Users**: B2B staffing agencies (Cova B.V., Oneflex B.V., Cova GmbH) managing multiple housing properties across different cities.

## User Preferences

Preferred communication style: Simple, everyday language.
All UI text must be in Turkish language.

## Recent Updates (October 2025)

### Room Highlight UX Enhancement (Latest - Oct 17, 2025)
Implemented temporary visual highlighting for newly added rooms in house edit dialog:
- **Problem Solved**: Users couldn't identify which room they just added in long room lists
- **Solution**: 3-second blue highlight on newly added room only (not last room)
- **Implementation**: 
  - useEffect monitors formData.rooms.length changes
  - useRef tracks previous room count to detect additions
  - Highlight classes: `bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800`
  - Automatic cleanup after 3 seconds via setTimeout
  - Highlight clears when dialog closes or form saves
- **Status**: ✅ Complete and tested with Playwright e2e tests

### Multi-Level Pricing System
Implemented comprehensive 3-level pricing hierarchy for rental management:
- **Daily Rental Mode**: Global toggle in Settings (ON/OFF) - when enabled, shows both daily and monthly rates
- **Pricing Hierarchy** (priority order):
  1. Room-specific pricing (highest priority)
  2. House-specific pricing
  3. Standard system pricing (Settings page)
- **Calculation Logic**:
  - <30 days: Daily rate × number of days
  - ≥30 days: (Full months × monthly rate) + (remaining days × daily rate)
- **Rental Types**: Per-bed or per-room basis (configurable per room)
- **UI Integration**:
  - Settings page: Daily rental toggle + standard pricing configuration
  - House dialog: House-level custom pricing (optional)
  - Room dialog: Room-level custom pricing (optional, only for rooms that can rent as whole)
- **Helper Functions**: `getApplicablePrice()` for hierarchy resolution, `calculateRentalPrice()` for cost computation
- **Implementation Status**: ✅ Complete with mock data and full UI

### House Archiving System
Implemented soft-delete archiving for houses with visual indicators:
- Archive/unarchive toggle in house edit dialog
- "Arşiv olanları da göster" switch in main view (default: hide archived)
- Visual indicators: reduced opacity, dashed border, "Arşiv" badge
- New houses initialize with `archived: false`
- All three meter types supported: electricity (kWh), water (m³), gas (m³)

### QR Approval Details Enhancement (Latest)
Expanded QR submission detail display in notifications:
- **Worker Registration**: Full details including firstName, lastName, phone, email, idNumber, dateOfBirth, gender
- **Meter Reading**: House name, meter type (electricity/water/gas), value, photo preview
- **Document Upload**: Document type with photo preview
- Collapsible detail sections with expand/collapse functionality
- Photo previews for all submission types with proper image display

### Check-in/Check-out System Infrastructure (Latest)
Added worker status management and key tracking system:
- **New Worker Statuses**: 
  - `new_registration`: Yeni kayıt (giriş bekliyor)
  - `checked_out`: Çıkış yaptı (no accommodation)
  - Plus existing: active, on_vacation, notice_period, left_no_notice
- **Check-in/Check-out Tracking**:
  - checkInDate: Giriş tarihi
  - checkOutDate: Çıkış tarihi
  - keyHandedOverDate: Anahtar teslim tarihi
  - keyReturnedDate: Anahtar iade tarihi
- **Business Logic**: Workers without active status (checked_out, new_registration) have no bed assignment

### QR Code Task Delegation System
Implemented comprehensive QR code system for delegating tasks to workers and external users. The system allows admins to create unique public links for:
- Worker self-registration (foreign nationals enter their own data)
- Meter readings with photo uploads
- Document uploads (ID cards, contracts, etc.)

**Key Features**:
- QR code generation with 10-character alphanumeric codes (case-sensitive)
- Configurable usage limits (unlimited, 1x, Xx times)
- Configurable expiry dates (unlimited, 1 day, 3 days, 1 month, 6 months)
- Status management (active, disabled, expired)
- Real-time pending approvals queue
- Public link validation with error handling
- Notification system (header bell icon with badge count)

**Implementation Status**: 
- ✅ Frontend UI mockups complete with mock data
- ✅ QR Management dashboard
- ✅ 3-step QR creation dialog
- ✅ Pending approvals page with approve/reject actions
- ✅ Public QR link pages (valid/invalid states)
- ⏳ Backend API integration pending
- ⏳ Database schema for QR codes pending

## System Architecture

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for build tooling and development server
- TanStack Query (React Query) for server state management
- Wouter for lightweight routing
- Tailwind CSS with shadcn/ui component library (New York style variant)
- Inter font family for typography

**Backend**
- Node.js with Express
- TypeScript throughout the stack
- JWT-based authentication with bcrypt password hashing
- Session management via connect-pg-simple

**Database & ORM**
- PostgreSQL as the primary database
- Neon Database serverless PostgreSQL client (@neondatabase/serverless)
- Drizzle ORM for type-safe database operations
- WebSocket support for Neon serverless connections

### Design System

**Approach**: Modern SaaS design inspired by Vercel, Linear, and Stripe
- Clarity-first with generous whitespace
- Data hierarchy visualization (houses → rooms → beds)
- Color-coded status system requiring zero learning curve
- Professional, trustworthy aesthetic for B2B context

**Status Colors** (Fixed System):
- Empty Beds: Red (#ef4444) - Alerts to availability
- Occupied Beds: Green (#10b981) - Confirms assignments  
- Reserved: Purple (#a855f7) - Future bookings
- Out of Service: Amber (#f59e0b) - Maintenance alerts

**Gender Indicators**:
- Male: Blue indicators
- Female: Pink indicators
- Displayed as circular badges on bed cards

### Multi-Tenancy Architecture

**Tenant Isolation**:
- All data entities scoped by `tenantId`
- User authentication tied to specific tenant
- Each tenant represents a staffing agency (e.g., Cova B.V., Oneflex B.V.)
- Row-level security enforced at application layer

**Authentication Flow**:
1. User logs in with email/password
2. JWT token generated containing userId, tenantId, email
3. Token stored in localStorage and included in API requests via Authorization header
4. Backend middleware verifies token and extracts tenant context
5. All database queries filtered by tenantId from authenticated user

### Database Schema Design

**Core Hierarchy**:
```
Tenants
  └── Users (admins for tenant)
  └── Houses
       └── Rooms
            └── Beds
  └── Workers
  └── Reservations (links workers to beds with date ranges)
```

**Key Entities**:
- **Tenants**: Multi-tenant isolation root
- **Houses**: Physical properties with address, coordinates, cost structure
- **Rooms**: Subdivisions with gender restrictions and room types
- **Beds**: Individual sleeping units with status tracking
- **Workers**: Personnel with gender and status information
- **Reservations**: Time-bound bed assignments with check-in/out tracking
- **QR Codes** (Future): Task delegation codes with usage limits and expiry
- **QR Submissions** (Future): Pending approvals from public QR forms

**Critical Fields**:
- Ownership types: owned, rented, third_party
- Bed statuses: available, occupied, reserved, oos (out of service)
- Gender restrictions: male_only, female_only, family_only, mixed
- Room types: standard, family, single, shared, suite

### API Structure

**Authentication**:
- `POST /api/auth/login` - Login with email/password, returns JWT token + user/tenant data

**Houses**:
- `GET /api/houses` - List houses with optional filters (date, city, showEmptyOnly)
- `GET /api/houses/:id` - Get house details with rooms and beds

**Workers**:
- `GET /api/workers` - List workers for tenant
- `POST /api/workers` - Create new worker

**Reservations**:
- `POST /api/reservations` - Create bed assignment
- `GET /api/reservations` - Query reservations by bed/room/date

**QR Codes** (Future Backend Implementation):
- `GET /api/qr-codes` - List QR codes for tenant
- `POST /api/qr-codes` - Create new QR code
- `PATCH /api/qr-codes/:id` - Update QR code (disable/enable)
- `DELETE /api/qr-codes/:id` - Delete QR code
- `GET /api/qr-codes/:code/validate` - Validate QR code for public access
- `POST /api/qr-submissions` - Submit form data from public QR link
- `GET /api/pending-approvals` - List pending submissions awaiting approval
- `POST /api/pending-approvals/:id/approve` - Approve pending submission
- `POST /api/pending-approvals/:id/reject` - Reject pending submission

**Authorization**: All endpoints (except login and public QR pages) require JWT token in Authorization header

### Business Logic Components

**Gender Conflict Detection**:
- System checks for mixed genders in same room with different surnames
- Warning modal presented with options: mark as couple, reassign worker, or continue anyway
- Prevents policy violations while allowing legitimate family scenarios

**Capacity Calculations**:
- Real-time aggregation of total/occupied/empty/OOS beds
- Occupancy rate percentage computation
- Per-house and system-wide metrics

**Date-Based Filtering**:
- Reservation queries support date range filtering
- Bed status calculated based on active reservations for selected date
- Empty bed highlighting for quick capacity identification

### State Management Strategy

**Server State**: TanStack Query
- Caching of house, worker, and reservation data
- Automatic refetching on component mount
- Manual refetch triggers after mutations (assignments, reservations)

**Client State**: React useState + Context
- Authentication state (user, tenant, token) via AuthContext
- Modal open/close states
- Form input states

**Local Storage**:
- JWT token persistence
- User and tenant data caching for session restoration

### Development & Build Setup

**Development Mode**:
- Vite dev server with HMR
- Express backend with tsx for TypeScript execution
- Concurrent frontend/backend in single process
- Replit-specific plugins for error overlay and dev banner

**Production Build**:
1. Frontend: Vite builds to `dist/public`
2. Backend: esbuild bundles server to `dist/index.js`
3. Server serves static frontend from dist/public
4. Single Node.js process serves both

**Path Aliases**:
- `@/*` → client/src/*
- `@shared/*` → shared/*
- `@assets/*` → attached_assets/*

## External Dependencies

### Third-Party Services

**Database**:
- Neon Database (Serverless PostgreSQL)
- Connection via DATABASE_URL environment variable
- WebSocket-based serverless connections

**Authentication**:
- JWT (jsonwebtoken library) for token generation/verification
- bcryptjs for password hashing
- No external auth service (self-managed)

### UI Component Libraries

**shadcn/ui Components** (Radix UI primitives):
- Dialog, Dropdown, Popover, Select, Toast for overlays
- Button, Input, Label, Checkbox for forms
- Card, Accordion, Tabs for layout
- All styled with Tailwind CSS utility classes

**Icons**: Lucide React (chevrons, buildings, users, calendar, map pins)

### Data Fetching

**TanStack Query**:
- Query caching and invalidation
- Automatic background refetching
- Loading and error states

**Fetch API**: 
- Native browser fetch for HTTP requests
- Custom apiRequest wrapper with auth token injection
- Error handling via response status checks

### Development Tools

**Replit-Specific**:
- @replit/vite-plugin-runtime-error-modal - Development error overlay
- @replit/vite-plugin-cartographer - Code navigation
- @replit/vite-plugin-dev-banner - Environment indicator

**Build Tools**:
- Vite 5.x - Frontend bundler and dev server
- esbuild - Backend TypeScript bundler for production
- tsx - TypeScript execution for development
- drizzle-kit - Database migrations and schema push

### Deployment Considerations

**Environment Variables Required**:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for token signing (defaults to dev key)
- `NODE_ENV` - production/development mode flag

**Migration Strategy**:
- Drizzle schema defined in `shared/schema.ts`
- Migrations folder for schema changes
- `npm run db:push` to sync schema to database
- Seed script available for test data (`scripts/seed.ts`)