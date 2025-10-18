# Database Setup

## PostgreSQL Configuration

This project uses PostgreSQL for persistent data storage with Drizzle ORM.

### Current Setup
- **Storage Mode**: DbStorage (PostgreSQL via Neon Database)
- **Auto-Seed**: Mock data automatically seeds on first application start
- **Mock Data**: 30 countries, 2 platform admins, 3 tenants, 7 users, 12 workers

### Fresh Database Setup

To set up a fresh PostgreSQL database with schema and mock data:

```bash
psql "$DATABASE_URL" < init-db.sql
```

This will:
1. Install required extensions (pgcrypto)
2. Create all database schemas and tables
3. Load mock/demo data

### File: `init-db.sql`

- **Size**: 933 lines
- **Contents**: Complete database dump including:
  - Schema (12 tables, 16 enums)
  - Mock data (30 countries, 2 admins, 3 tenants, 7 users, 12 workers)
  - Constraints and indexes

### Development Workflow

1. **Schema Changes**: Edit `shared/schema.ts`
2. **Apply Changes**: Run `npm run db:push --force`
3. **Export Updated SQL**: Run `pg_dump "$DATABASE_URL" --clean --if-exists --no-owner --no-acl > init-db.sql`

### Mock Data

All mock data is defined in:
- `server/demo-data.ts` - Platform admins, tenants, users, countries
- `client/src/mocks/federated-data.ts` - Worker profiles, employments

The `DbStorage` class automatically seeds this data on first run if the database is empty.

### Database Tables

1. **countries** - Platform-level country reference data
2. **platform_admins** - ARPDO team admin accounts
3. **tenants** - Customer organizations
4. **users** - Tenant-level user accounts
5. **worker_profiles** - Global worker identity data
6. **employments** - Tenant-specific employment records
7. **employment_private_data** - Sensitive employment data
8. **houses** - Accommodation properties
9. **rooms** - Rooms within houses
10. **beds** - Individual beds
11. **reservations** - Worker accommodations bookings
12. **user_preferences** - User-specific preferences

### Connection Details

Database connection is configured via environment variables set by Replit:
- `DATABASE_URL` - Full connection string
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` - Individual connection parameters
