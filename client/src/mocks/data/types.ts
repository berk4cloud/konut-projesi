/**
 * Mock Data Types
 * Tüm veritabanı tablolarını TypeScript interface'leri olarak tanımlar
 */

// ============================================
// ENUMS
// ============================================

export type BedStatus = "available" | "occupied" | "reserved" | "out_of_service";
export type OwnershipType = "rent" | "owned";
export type HouseStatus = "active" | "inactive" | "maintenance";
export type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type RoomReservationStatus = "active" | "checked_out" | "cancelled";
export type RoomType = "single" | "double" | "triple" | "quad" | "dormitory";
export type GenderRestriction = "male" | "female" | "mixed" | "none";
export type WorkerGender = "male" | "female";
export type EmploymentStatus = "active" | "inactive" | "former" | "invited";
export type Currency = "EUR" | "USD" | "TRY" | "GBP" | "CHF" | "CAD" | "MXN" | "CNY" | "JPY" | "RUB" | "SEK" | "NOK" | "DKK" | "HUF" | "PLN" | "CZK" | "RON" | "BGN" | "RSD" | "UAH";
export type QRCodeType = "worker_registration" | "meter_reading" | "document_upload";
export type QRCodeStatus = "active" | "disabled" | "expired";
export type GuestRegistrationRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AssignmentStatus = "active" | "ending_soon" | "ended";
export type DepositStatus = "pending" | "collected" | "refunded" | "partially_refunded";
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";
export type PaymentMethod = "cash" | "bank_transfer" | "pos" | "other";
export type ChargeCalculationType = "full_month" | "partial" | "prorated";
export type PlatformAdminRole = "super_admin" | "admin" | "support";
export type TenantType = "direct_employer" | "staffing_agency";
export type TenantStatus = "trial" | "active" | "suspended" | "cancelled";
export type TenantPlan = "basic" | "professional" | "enterprise";
export type TenantUserStatus = "invited" | "active" | "inactive";
export type TenantRole = "owner" | "admin" | "hr_manager" | "planner" | "accommodation_manager" | "transport_manager" | "finance" | "viewer";

// ============================================
// PLATFORM LEVEL TABLES
// ============================================

export interface Country {
  isoCode: string; // PK, varchar(2)
  nameTr: string;
  nameEn: string;
  nameDe: string;
  nameNl: string;
  nameFr: string;
  namePl: string;
  nameBg: string;
  flagEmoji?: string | null;
  phoneCode?: string | null;
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface PlatformAdmin {
  id: string; // PK, UUID
  email: string; // Unique
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: PlatformAdminRole;
  lastLoginAt?: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Tenant {
  id: string; // PK, UUID
  name: string;
  slug: string; // Unique
  type: TenantType;
  status: TenantStatus;
  contactEmail?: string | null;
  contactPhone?: string | null;
  plan: TenantPlan;
  trialEndsAt?: string | null; // ISO timestamp
  subscriptionStartsAt?: string | null; // ISO timestamp
  modules: {
    workers?: boolean;
    planning?: boolean;
    accommodation?: boolean;
    transport?: boolean;
    finance?: boolean;
  };
  currency: Currency;
  timezone: string; // IANA timezone
  pricingSettings: {
    dailyRentalEnabled?: boolean;
    standardPricing?: {
      bedDailyPrice?: number;
      bedMonthlyPrice?: number;
      roomDailyPrice?: number;
      roomMonthlyPrice?: number;
    };
  };
  favoriteCountries?: string[] | null; // ISO codes array
  defaultCountry?: string | null; // ISO code
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdBy?: string | null; // FK to platform_admins
}

// ============================================
// TENANT LEVEL TABLES
// ============================================

export interface User {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  email: string; // Unique per tenant
  password?: string | null; // Hashed, nullable
  firstName: string;
  lastName: string;
  roles: TenantRole[]; // Array
  status: TenantUserStatus;
  invitedAt?: string | null; // ISO timestamp
  invitedBy?: string | null; // User ID or Platform Admin ID
  activatedAt?: string | null; // ISO timestamp
  invitationToken?: string | null;
  lastLoginAt?: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface UserPreference {
  email: string; // PK
  lastTenantId?: string | null; // FK to tenants
  lastSelections: Record<string, string>; // {"tenant-id": "role"}
  updatedAt: string; // ISO timestamp
}

// ============================================
// FEDERATED WORKER IDENTITY MODEL
// ============================================

export interface WorkerProfile {
  id: string; // PK, UUID
  email: string; // Unique
  password?: string | null; // Hashed, nullable
  firstName: string;
  lastName: string;
  gender: WorkerGender;
  phone?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null; // ISO date
  photo?: string | null;
  bio?: string | null;
  address?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Employment {
  id: string; // PK, UUID
  workerProfileId: string; // FK to worker_profiles
  tenantId: string; // FK to tenants
  status: EmploymentStatus;
  startDate: string; // ISO date
  endDate?: string | null; // ISO date
  snapshotGender: WorkerGender;
  snapshotPhoto?: string | null;
  snapshotFirstName: string;
  snapshotLastName: string;
  jobTitle?: string | null;
  department?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdBy?: string | null; // FK to users
}

export interface EmploymentPrivateData {
  id: string; // PK, UUID
  employmentId: string; // FK to employments (unique)
  salary?: string | null; // numeric as string
  salaryFrequency?: string | null; // "hourly", "monthly", "yearly"
  currency: Currency;
  contractType?: string | null; // "full_time", "part_time", etc.
  contractStartDate?: string | null; // ISO date
  contractEndDate?: string | null; // ISO date
  internalNotes?: string | null;
  performanceRating?: string | null; // numeric as string, 1-5 scale
  managerId?: string | null; // FK to users
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// ============================================
// HOUSING TABLES
// ============================================

export interface House {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  name: string;
  address?: string | null;
  houseNumber?: string | null;
  houseNumberAddition?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: string | null; // numeric as string
  longitude?: string | null; // numeric as string
  totalRooms: number;
  totalBeds: number;
  costPerWeek?: string | null; // numeric as string
  costPerBedPerDay?: string | null; // numeric as string
  ownershipType?: OwnershipType | null;
  status: HouseStatus;
  description?: string | null;
  internalNotes?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Room {
  id: string; // PK, UUID
  houseId: string; // FK to houses
  roomNumber: string;
  floor?: number | null;
  roomType?: RoomType | null;
  bedCount: number;
  genderRestriction: GenderRestriction;
  isFamilyRoom: boolean;
  availableForRoomRental: boolean;
  status: string; // "active" | "inactive"
  costPerDay?: string | null; // numeric as string
  costPerMonth?: string | null; // numeric as string
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Bed {
  id: string; // PK, UUID
  roomId: string; // FK to rooms
  bedNumber: number;
  status: BedStatus;
  roomReservationId?: string | null; // FK to room_reservations
  lastOccupiedBy?: string | null; // FK to employments
  lastOccupiedAt?: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// ============================================
// RESERVATION TABLES
// ============================================

export interface Reservation {
  id: string; // PK, UUID
  employmentId: string; // FK to employments
  houseId: string; // FK to houses
  roomId: string; // FK to rooms
  bedId: string; // FK to beds
  tenantId: string; // FK to tenants
  startDate: string; // ISO date
  endDate?: string | null; // ISO date
  checkInDate?: string | null; // ISO date
  checkOutDate?: string | null; // ISO date
  status: ReservationStatus;
  dailyRate?: string | null; // numeric as string
  totalCost?: string | null; // numeric as string
  onVacation: boolean;
  belongingsInRoom: boolean;
  description?: string | null;
  internalNotes?: string | null;
  notes: string[]; // Array
  confirmedBy?: string | null; // FK to users
  confirmedAt?: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdBy?: string | null; // FK to users
}

export interface RoomReservation {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  houseId: string; // FK to houses
  roomId: string; // FK to rooms
  leadEmploymentId?: string | null; // FK to employments
  startDate: string; // ISO date
  endDate?: string | null; // ISO date
  checkInDate?: string | null; // ISO date
  checkOutDate?: string | null; // ISO date
  status: RoomReservationStatus;
  monthlyRate?: string | null; // numeric as string
  dailyRate?: string | null; // numeric as string
  totalCost?: string | null; // numeric as string
  depositAmount?: string | null; // numeric as string
  depositCollected: boolean;
  depositDate?: string | null; // ISO date
  description?: string | null;
  internalNotes?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt?: string | null; // ISO timestamp
  createdBy?: string | null; // FK to users
}

export interface RoomReservationOccupant {
  id: string; // PK, UUID
  roomReservationId: string; // FK to room_reservations
  employmentId?: string | null; // FK to employments
  guestName?: string | null;
  guestGender?: WorkerGender | null;
  notes?: string | null;
  createdAt: string; // ISO timestamp
}

// ============================================
// QR CODES TABLE
// ============================================

export interface QRCode {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  type: QRCodeType;
  code: string; // Unique, max 20 chars
  title: string;
  status: QRCodeStatus;
  usageLimit?: number | null;
  usedCount: number;
  expiryDate?: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
  createdBy?: string | null; // FK to users
}

// ============================================
// GUEST REGISTRATION REQUESTS
// ============================================

export interface GuestRegistrationRequest {
  id: string;
  qrCodeId: string;
  tenantId: string;
  qrCode: string;
  fullName: string;
  country: string;
  phone: string;
  email: string;
  gender?: WorkerGender | null;
  visitStartDate: string; // ISO date
  visitEndDate: string; // ISO date
  apartment?: string | null;
  notes?: string | null;
  status: GuestRegistrationRequestStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// ============================================
// ASSIGNMENT MANAGEMENT TABLES
// ============================================

export interface Assignment {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  employmentId: string; // FK to employments
  houseId: string; // FK to houses
  roomId: string; // FK to rooms
  bedId: string; // FK to beds
  startDate: string; // ISO date
  endDate?: string | null; // ISO date
  monthlyRate: string; // numeric as string
  status: AssignmentStatus;
  depositCollected: boolean;
  depositAmount: string; // numeric as string
  depositDate?: string | null; // ISO date
  depositCollector?: string | null; // FK to users
  depositStatus: DepositStatus;
  depositRefundDate?: string | null; // ISO date
  depositRefundAmount?: string | null; // numeric as string
  damageAmount?: string | null; // numeric as string
  damageNote?: string | null;
  agreementNotes?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt?: string | null; // ISO timestamp
  createdBy?: string | null; // FK to users
}

export interface AssignmentNote {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  assignmentId: string; // FK to assignments
  note: string;
  createdBy: string; // FK to users
  createdAt: string; // ISO timestamp
}

export interface Charge {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  assignmentId: string; // FK to assignments
  month: string; // "YYYY-MM" format
  amount: string; // numeric as string
  expectedAmount: string; // numeric as string
  remainingAmount: string; // numeric as string
  days: number;
  calculationType: ChargeCalculationType;
  dueDate: string; // ISO date
  status: PaymentStatus;
  notes?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt?: string | null; // ISO timestamp
}

export interface Payment {
  id: string; // PK, UUID
  tenantId: string; // FK to tenants
  chargeId: string; // FK to charges
  amount: string; // numeric as string
  paymentDate: string; // ISO date
  paymentMethod: PaymentMethod;
  collectorName?: string | null;
  recordedAt: string; // ISO timestamp
  reference?: string | null;
  notes?: string | null;
  createdAt: string; // ISO timestamp
  createdBy?: string | null; // FK to users
}

