/**
 * Mock API Service
 * Tüm backend API endpoint'lerini mock eden servis katmanı
 * localStorage ile veri persist eder
 */

import {
  mockPlatformAdmins,
  mockUsers,
  mockCountries,
  mockTenants,
  mockWorkerProfiles,
  mockEmployments,
  mockEmploymentPrivateData,
  mockHouses,
  mockRooms,
  mockBeds,
  mockReservations,
  mockRoomReservations,
  mockRoomReservationOccupants,
  mockQRCodes,
  mockGuestRegistrationRequests,
  mockAssignments,
  mockAssignmentNotes,
  mockCharges,
  mockPayments,
} from '@/mocks/data';
import type {
  PlatformAdmin,
  User,
  Country,
  Tenant,
  WorkerProfile,
  Employment,
  EmploymentPrivateData,
  House,
  Room,
  Bed,
  Reservation,
  RoomReservation,
  RoomReservationOccupant,
  QRCode,
  GuestRegistrationRequest,
  WorkerGender,
  Assignment,
  AssignmentNote,
  Charge,
  Payment,
} from '@/mocks/data/types';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Simüle edilmiş network gecikmesi
 */
const delay = (ms: number = 200): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * localStorage key'leri
 */
const STORAGE_KEYS = {
  PLATFORM_ADMINS: 'mock_platform_admins',
  USERS: 'mock_users',
  COUNTRIES: 'mock_countries',
  TENANTS: 'mock_tenants',
  WORKER_PROFILES: 'mock_worker_profiles',
  EMPLOYMENTS: 'mock_employments',
  EMPLOYMENT_PRIVATE_DATA: 'mock_employment_private_data',
  HOUSES: 'mock_houses',
  ROOMS: 'mock_rooms',
  BEDS: 'mock_beds',
  RESERVATIONS: 'mock_reservations',
  ROOM_RESERVATIONS: 'mock_room_reservations',
  ROOM_RESERVATION_OCCUPANTS: 'mock_room_reservation_occupants',
  QR_CODES: 'mock_qr_codes',
  ASSIGNMENTS: 'mock_assignments',
  ASSIGNMENT_NOTES: 'mock_assignment_notes',
  CHARGES: 'mock_charges',
  PAYMENTS: 'mock_payments',
  GUEST_REGISTRATION_REQUESTS: 'mock_guest_registration_requests',
  MOCK_DATA_VERSION: 'mock_data_version', // Mock data version kontrolü için
};

// Mock data version - mock data güncellendiğinde bu versiyonu artır
const MOCK_DATA_VERSION = '2.0.0';

/**
 * localStorage helper fonksiyonları
 */
const storage = {
  get: <T>(key: string, defaultValue: T[]): T[] => {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        storage.set(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
    }
  },
};

/**
 * UUID generator
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hata oluştur
 */
const createError = (message: string, status: number = 400): Error => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Mock data'yı localStorage'a yükle (ilk çalıştırmada veya version değiştiğinde)
 * Mock API kullanılıyorsa, her zaman temiz mock verileri yükler
 */
export const initializeMockData = (): void => {
  // Environment variable ile zorunlu reset kontrolü
  const forceReset = import.meta.env.VITE_FORCE_RESET_MOCK_DATA === "true" || import.meta.env.VITE_FORCE_RESET_MOCK_DATA === "1";
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === "development";
  const storedVersion = localStorage.getItem(STORAGE_KEYS.MOCK_DATA_VERSION);
  // Version değiştiğinde veya zorunlu reset istendiğinde mock verileri yeniden yükle
  const shouldReset = forceReset || !storedVersion || storedVersion !== MOCK_DATA_VERSION;
  
  // Mock API kullanılıyorsa, version kontrolü yaparak verileri yükle
  // Eğer version yoksa veya farklıysa, tüm mock verileri yeniden yükle
  if (shouldReset) {
    // Tüm mock verileri temiz mock verilerle yükle
    storage.set(STORAGE_KEYS.PLATFORM_ADMINS, mockPlatformAdmins);
    storage.set(STORAGE_KEYS.USERS, mockUsers);
    storage.set(STORAGE_KEYS.COUNTRIES, mockCountries);
    storage.set(STORAGE_KEYS.TENANTS, mockTenants);
    storage.set(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    storage.set(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    storage.set(STORAGE_KEYS.EMPLOYMENT_PRIVATE_DATA, mockEmploymentPrivateData);
    storage.set(STORAGE_KEYS.HOUSES, mockHouses);
    storage.set(STORAGE_KEYS.ROOMS, mockRooms);
    storage.set(STORAGE_KEYS.BEDS, mockBeds);
    storage.set(STORAGE_KEYS.RESERVATIONS, mockReservations);
    storage.set(STORAGE_KEYS.ROOM_RESERVATIONS, mockRoomReservations);
    storage.set(STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS, mockRoomReservationOccupants);
    // QR kodlarını yüklerken sadece worker_registration tipindekileri sakla
    const filteredQRCodes = mockQRCodes.filter((qr) => qr.type === 'worker_registration');
    storage.set(STORAGE_KEYS.QR_CODES, filteredQRCodes);
    storage.set(STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS, mockGuestRegistrationRequests);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    storage.set(STORAGE_KEYS.ASSIGNMENT_NOTES, mockAssignmentNotes);
    storage.set(STORAGE_KEYS.CHARGES, mockCharges);
    storage.set(STORAGE_KEYS.PAYMENTS, mockPayments);
    
    // Version'ı kaydet
    localStorage.setItem(STORAGE_KEYS.MOCK_DATA_VERSION, MOCK_DATA_VERSION);
  } else {
    // Version aynıysa, sadece eksik olanları yükle
    if (!localStorage.getItem(STORAGE_KEYS.PLATFORM_ADMINS)) {
      storage.set(STORAGE_KEYS.PLATFORM_ADMINS, mockPlatformAdmins);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      storage.set(STORAGE_KEYS.USERS, mockUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUNTRIES)) {
      storage.set(STORAGE_KEYS.COUNTRIES, mockCountries);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      storage.set(STORAGE_KEYS.TENANTS, mockTenants);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKER_PROFILES)) {
      storage.set(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYMENTS)) {
      storage.set(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYMENT_PRIVATE_DATA)) {
      storage.set(STORAGE_KEYS.EMPLOYMENT_PRIVATE_DATA, mockEmploymentPrivateData);
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOUSES)) {
      storage.set(STORAGE_KEYS.HOUSES, mockHouses);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      storage.set(STORAGE_KEYS.ROOMS, mockRooms);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BEDS)) {
      storage.set(STORAGE_KEYS.BEDS, mockBeds);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      storage.set(STORAGE_KEYS.RESERVATIONS, mockReservations);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOM_RESERVATIONS)) {
      storage.set(STORAGE_KEYS.ROOM_RESERVATIONS, mockRoomReservations);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS)) {
      storage.set(STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS, mockRoomReservationOccupants);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QR_CODES)) {
      // QR kodlarını yüklerken sadece worker_registration tipindekileri sakla
      const filteredQRCodes = mockQRCodes.filter((qr) => qr.type === 'worker_registration');
      storage.set(STORAGE_KEYS.QR_CODES, filteredQRCodes);
    } else {
      // Mevcut QR kodlarını filtrele - document_upload ve meter_reading tiplerini kaldır
      const existingQRCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
      const filteredQRCodes = existingQRCodes.filter((qr) => qr.type === 'worker_registration');
      storage.set(STORAGE_KEYS.QR_CODES, filteredQRCodes);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS)) {
      storage.set(STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS, mockGuestRegistrationRequests);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      storage.set(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_NOTES)) {
      storage.set(STORAGE_KEYS.ASSIGNMENT_NOTES, mockAssignmentNotes);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHARGES)) {
      storage.set(STORAGE_KEYS.CHARGES, mockCharges);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      storage.set(STORAGE_KEYS.PAYMENTS, mockPayments);
    }
  }
};

// İlk çalıştırmada initialize et
initializeMockData();

// ============================================
// AUTHENTICATION API
// ============================================

export const mockApi = {
  // POST /api/login
  login: async (data: { email: string; password: string }) => {
    await delay(300);

    // Platform admin kontrolü
    const platformAdmins = storage.get<PlatformAdmin>(STORAGE_KEYS.PLATFORM_ADMINS, mockPlatformAdmins);
    const admin = platformAdmins.find((a) => a.email === data.email);
    if (admin && data.password === 'admin123') {
      // Mock password check
      return {
        type: 'platform_admin' as const,
        token: `mock-token-admin-${admin.id}`,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        },
      };
    }

    // Tenant user kontrolü
    const users = storage.get<User>(STORAGE_KEYS.USERS, mockUsers);
    const userRecords = users.filter((u) => u.email === data.email);

    if (userRecords.length === 0) {
      throw createError('Geçersiz email veya şifre', 401);
    }

    // Mock password check
    if (data.password !== 'password123') {
      throw createError('Geçersiz email veya şifre', 401);
    }

    const firstUser = userRecords[0];
    if (firstUser.status !== 'active') {
      throw createError('Hesap aktif değil', 403);
    }

    // Single tenant + single role
    if (userRecords.length === 1 && firstUser.roles.length === 1) {
      const tenant = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants).find((t) => t.id === firstUser.tenantId);
      if (!tenant) throw createError('Tenant bulunamadı', 404);

      return {
        type: 'redirect' as const,
        token: `mock-token-${firstUser.id}`,
        user: {
          id: firstUser.id,
          email: firstUser.email,
          firstName: firstUser.firstName,
          lastName: firstUser.lastName,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          favoriteCountries: tenant.favoriteCountries || [],
          defaultCountry: tenant.defaultCountry || null,
        },
        role: firstUser.roles[0],
      };
    }

    // Single tenant + multiple roles
    if (userRecords.length === 1) {
      const tenant = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants).find((t) => t.id === firstUser.tenantId);
      if (!tenant) throw createError('Tenant bulunamadı', 404);

      return {
        type: 'select_role' as const,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          favoriteCountries: tenant.favoriteCountries || [],
          defaultCountry: tenant.defaultCountry || null,
        },
        roles: firstUser.roles,
        user: {
          id: firstUser.id,
          email: firstUser.email,
          firstName: firstUser.firstName,
          lastName: firstUser.lastName,
        },
      };
    }

    // Multiple tenants
    const tenants = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants);
    return {
      type: 'select_tenant' as const,
      tenants: userRecords.map((u) => {
        const tenant = tenants.find((t) => t.id === u.tenantId);
        return {
          tenant: {
            id: tenant?.id || '',
            name: tenant?.name || '',
            slug: tenant?.slug || '',
            type: tenant?.type || 'staffing_agency',
          },
          roles: u.roles,
        };
      }),
      user: {
        email: firstUser.email,
        firstName: firstUser.firstName,
        lastName: firstUser.lastName,
      },
    };
  },

  // POST /api/tenant/login
  tenantLogin: async (data: { email: string; password: string }, tenantSlug?: string) => {
    await delay(250);

    const tenants = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants);
    const tenant = tenantSlug ? tenants.find((t) => t.slug === tenantSlug) : null;

    if (!tenant) {
      throw createError('Tenant bulunamadı', 404);
    }

    const users = storage.get<User>(STORAGE_KEYS.USERS, mockUsers);
    const user = users.find((u) => u.email === data.email && u.tenantId === tenant.id);

    if (!user || data.password !== 'password123') {
      throw createError('Geçersiz email veya şifre', 401);
    }

    if (user.status !== 'active') {
      throw createError('Hesap aktif değil', 403);
    }

    return {
      token: `mock-token-${user.id}`,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        selectedRole: user.roles[0],
        status: user.status,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        type: tenant.type,
        status: tenant.status,
        plan: tenant.plan,
        modules: tenant.modules,
        favoriteCountries: tenant.favoriteCountries || [],
        defaultCountry: tenant.defaultCountry || null,
      },
    };
  },

  // POST /api/platform/login
  platformLogin: async (data: { email: string; password: string }) => {
    await delay(200);

    const platformAdmins = storage.get<PlatformAdmin>(STORAGE_KEYS.PLATFORM_ADMINS, mockPlatformAdmins);
    const admin = platformAdmins.find((a) => a.email === data.email);

    if (!admin || data.password !== 'admin123') {
      throw createError('Invalid email or password', 401);
    }

    return {
      token: `mock-token-admin-${admin.id}`,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  },

  // POST /api/login/confirm
  loginConfirm: async (data: { email: string; tenantId: string; role: string }) => {
    await delay(200);

    const users = storage.get<User>(STORAGE_KEYS.USERS, mockUsers);
    const user = users.find((u) => u.email === data.email && u.tenantId === data.tenantId);

    if (!user || user.status !== 'active') {
      throw createError('Kullanıcı bulunamadı veya aktif değil', 401);
    }

    if (!user.roles.includes(data.role as any)) {
      throw createError('Bu role sahip değilsiniz', 403);
    }

    const tenants = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants);
    const tenant = tenants.find((t) => t.id === data.tenantId);

    if (!tenant) {
      throw createError('Tenant bulunamadı', 404);
    }

    return {
      token: `mock-token-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        favoriteCountries: tenant.favoriteCountries || [],
        defaultCountry: tenant.defaultCountry || null,
      },
      role: data.role,
    };
  },

  // POST /api/logout
  logout: async () => {
    await delay(100);
    return { success: true, message: 'Çıkış yapıldı' };
  },

  // ============================================
  // WORKER MANAGEMENT API
  // ============================================

  // GET /api/workers
  getWorkers: async (tenantId?: string) => {
    await delay(250);

    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);

    let filteredEmployments = employments;
    if (tenantId) {
      filteredEmployments = employments.filter((e) => e.tenantId === tenantId && e.status === 'active');
    }

    const workers = filteredEmployments.map((employment) => {
      const profile = workerProfiles.find((p) => p.id === employment.workerProfileId);
      if (!profile) return null;

      // Housing info
      const assignment = assignments.find((a) => a.employmentId === employment.id && a.status === 'active');
      const reservation = reservations.find((r) => r.employmentId === employment.id && r.status === 'checked_in');

      let housing = null;
      if (assignment || reservation) {
        const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
        const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
        const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);

        const bedId = assignment?.bedId || reservation?.bedId;
        const bed = bedId ? beds.find((b) => b.id === bedId) : null;
        const room = bed ? rooms.find((r) => r.id === bed.roomId) : null;
        const house = room ? houses.find((h) => h.id === room.houseId) : null;

        if (house && room && bed) {
          housing = {
            type: 'bed' as const,
            houseId: house.id,
            houseName: house.name,
            roomId: room.id,
            roomNumber: room.roomNumber,
            bedId: bed.id,
            bedNumber: bed.bedNumber,
            isLeadTenant: false,
            leadTenantName: null,
            monthlyRate: assignment ? parseFloat(assignment.monthlyRate) : 600,
          };
        }
      }

      return {
        id: employment.id,
        employmentId: employment.id,
        profileId: profile.id,
        tenantId: employment.tenantId,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        phone: profile.phone,
        nationality: profile.nationality,
        dateOfBirth: profile.dateOfBirth,
        photo: profile.photo,
        status: employment.status,
        jobTitle: employment.jobTitle,
        department: employment.department,
        startDate: employment.startDate,
        endDate: employment.endDate,
        housing,
      };
    });

    return workers.filter((w) => w !== null);
  },

  // GET /api/workers-with-accommodation
  getWorkersWithAccommodation: async (tenantId?: string) => {
    await delay(300);

    const workers = await mockApi.getWorkers(tenantId);
    return workers.filter((w) => w.housing !== null);
  },

  // GET /api/workers/:employmentId
  getWorker: async (employmentId: string) => {
    await delay(200);

    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const employment = employments.find((e) => e.id === employmentId);

    if (!employment) {
      throw createError('Worker not found', 404);
    }

    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    const profile = workerProfiles.find((p) => p.id === employment.workerProfileId);

    if (!profile) {
      throw createError('Worker profile not found', 404);
    }

    return {
      id: employment.id,
      employmentId: employment.id,
      profileId: profile.id,
      tenantId: employment.tenantId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      phone: profile.phone,
      nationality: profile.nationality,
      dateOfBirth: profile.dateOfBirth,
      photo: profile.photo,
      status: employment.status,
      jobTitle: employment.jobTitle,
      department: employment.department,
      startDate: employment.startDate,
      endDate: employment.endDate,
    };
  },

  // POST /api/workers
  createWorker: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    phone?: string;
    nationality?: string;
    dateOfBirth?: string;
    jobTitle?: string;
    department?: string;
    startDate?: string;
    salary?: string;
    salaryFrequency?: string;
    contractType?: string;
    tenantId: string;
  }) => {
    await delay(400);

    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    let workerProfile = workerProfiles.find((p) => p.email === data.email);

    if (!workerProfile) {
      workerProfile = {
        id: generateId(),
        email: data.email,
        password: null,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        phone: data.phone || null,
        nationality: data.nationality || null,
        dateOfBirth: data.dateOfBirth || null,
        photo: null,
        bio: null,
        address: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      workerProfiles.push(workerProfile);
      storage.set(STORAGE_KEYS.WORKER_PROFILES, workerProfiles);
    }

    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const employment: Employment = {
      id: generateId(),
      workerProfileId: workerProfile.id,
      tenantId: data.tenantId,
      status: 'active',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: null,
      snapshotGender: workerProfile.gender,
      snapshotPhoto: workerProfile.photo,
      snapshotFirstName: workerProfile.firstName,
      snapshotLastName: workerProfile.lastName,
      jobTitle: data.jobTitle || null,
      department: data.department || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
    };
    employments.push(employment);
    storage.set(STORAGE_KEYS.EMPLOYMENTS, employments);

    // Employment private data
    if (data.salary || data.contractType) {
      const privateData = storage.get<EmploymentPrivateData>(
        STORAGE_KEYS.EMPLOYMENT_PRIVATE_DATA,
        mockEmploymentPrivateData
      );
      privateData.push({
        id: generateId(),
        employmentId: employment.id,
        salary: data.salary || null,
        salaryFrequency: data.salaryFrequency || null,
        currency: 'EUR',
        contractType: data.contractType || null,
        contractStartDate: data.startDate || null,
        contractEndDate: null,
        internalNotes: null,
        performanceRating: null,
        managerId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      storage.set(STORAGE_KEYS.EMPLOYMENT_PRIVATE_DATA, privateData);
    }

    return {
      id: employment.id,
      employmentId: employment.id,
      profileId: workerProfile.id,
      tenantId: employment.tenantId,
      email: workerProfile.email,
      firstName: workerProfile.firstName,
      lastName: workerProfile.lastName,
      gender: workerProfile.gender,
      phone: workerProfile.phone,
      nationality: workerProfile.nationality,
      status: employment.status,
      jobTitle: employment.jobTitle,
      department: employment.department,
      startDate: employment.startDate,
    };
  },

  // PATCH /api/worker-profiles/:id
  updateWorkerProfile: async (id: string, data: Partial<WorkerProfile>) => {
    await delay(300);

    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    const index = workerProfiles.findIndex((p) => p.id === id);

    if (index === -1) {
      throw createError('Worker profile not found', 404);
    }

    workerProfiles[index] = {
      ...workerProfiles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.WORKER_PROFILES, workerProfiles);

    return workerProfiles[index];
  },

  // PATCH /api/employments/:id
  updateEmployment: async (id: string, data: Partial<Employment>) => {
    await delay(300);

    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const index = employments.findIndex((e) => e.id === id);

    if (index === -1) {
      throw createError('Employment not found', 404);
    }

    employments[index] = {
      ...employments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.EMPLOYMENTS, employments);

    return employments[index];
  },

  // GET /api/worker-profiles/:email
  getWorkerProfileByEmail: async (email: string) => {
    await delay(200);

    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    const profile = workerProfiles.find((p) => p.email === email);

    if (!profile) {
      throw createError('Worker profile not found', 404);
    }

    return profile;
  },

  // GET /api/employments/worker/:workerProfileId
  getEmploymentsByWorkerProfile: async (workerProfileId: string) => {
    await delay(200);

    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    return employments.filter((e) => e.workerProfileId === workerProfileId);
  },

  // ============================================
  // COUNTRIES API
  // ============================================

  // GET /api/countries
  getCountries: async () => {
    await delay(150);
    const countries = storage.get<Country>(STORAGE_KEYS.COUNTRIES, mockCountries);
    return countries.filter((c) => c.isActive);
  },

  // ============================================
  // TENANT SETTINGS API
  // ============================================

  // GET /api/tenants/:id
  getTenant: async (id: string) => {
    await delay(200);

    const tenants = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants);
    const tenant = tenants.find((t) => t.id === id);

    if (!tenant) {
      throw createError('Tenant not found', 404);
    }

    return {
      ...tenant,
      favoriteCountries: tenant.favoriteCountries || [],
      defaultCountry: tenant.defaultCountry || null,
    };
  },

  // PATCH /api/tenants/:id
  updateTenant: async (id: string, data: Partial<Tenant>) => {
    await delay(300);

    const tenants = storage.get<Tenant>(STORAGE_KEYS.TENANTS, mockTenants);
    const index = tenants.findIndex((t) => t.id === id);

    if (index === -1) {
      throw createError('Tenant not found', 404);
    }

    tenants[index] = {
      ...tenants[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.TENANTS, tenants);

    return {
      ...tenants[index],
      favoriteCountries: tenants[index].favoriteCountries || [],
      defaultCountry: tenants[index].defaultCountry || null,
    };
  },

  // ============================================
  // HOUSES API
  // ============================================

  // GET /api/houses
  getHouses: async (tenantId?: string, date?: string) => {
    await delay(300);

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);
    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    const roomReservations = storage.get<RoomReservation>(STORAGE_KEYS.ROOM_RESERVATIONS, mockRoomReservations);
    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);

    let filteredHouses = houses;
    if (tenantId) {
      filteredHouses = houses.filter((h) => h.tenantId === tenantId);
    }

    const selectedDate = date || new Date().toISOString().split('T')[0];

    return filteredHouses.map((house) => {
      const houseRooms = rooms.filter((r) => r.houseId === house.id);

      const roomsWithBeds = houseRooms.map((room) => {
        const roomBeds = beds.filter((b) => b.roomId === room.id);
        const roomReservation = roomReservations.find(
          (rr) => rr.roomId === room.id && rr.status === 'active'
        );

        // Helper function to normalize dates to YYYY-MM-DD format for comparison
        const normalizeDate = (dateStr: string | null | undefined): string | null => {
          if (!dateStr) return null;
          // If ISO format (has 'T' or 'Z'), extract just the date part
          if (dateStr.includes('T') || dateStr.includes('Z')) {
            return dateStr.split('T')[0];
          }
          // If already YYYY-MM-DD format, return as is
          return dateStr;
        };

        const bedsWithWorkers = roomBeds.map((bed) => {
          // Find all reservations for this bed
          const bedReservations = reservations.filter(
            (r) => r.bedId === bed.id && r.status === 'checked_in'
          );

          let worker = undefined;
          let status: Bed['status'] = bed.status;
          let hasFutureReservation = false;
          let reservation = null;
          let futureReservation = null;

          // Find active reservation for selected date
          for (const res of bedReservations) {
            const checkInDateStr = normalizeDate(res.checkInDate || res.startDate);
            const checkOutDateStr = normalizeDate(res.checkOutDate || res.endDate);

            // Check if reservation is active on selected date
            if (checkInDateStr && checkInDateStr <= selectedDate && (!checkOutDateStr || checkOutDateStr > selectedDate)) {
              // This reservation is active on selected date
              reservation = res;
            } else if (checkInDateStr && checkInDateStr > selectedDate) {
              // This is a future reservation
              const futureCheckIn = normalizeDate(futureReservation?.checkInDate || futureReservation?.startDate);
              if (!futureReservation || (futureCheckIn && checkInDateStr < futureCheckIn)) {
                futureReservation = res;
              }
            }
          }

          // Use active reservation if found, otherwise check future reservation
          const activeReservation = reservation || futureReservation;
          if (futureReservation && !reservation) {
            hasFutureReservation = true;
          }

          if (activeReservation) {
            const employment = employments.find((e) => e.id === activeReservation.employmentId);
            if (employment) {
              const profile = workerProfiles.find((p) => p.id === employment.workerProfileId);
              if (profile) {
                worker = {
                  employmentId: employment.id,
                  name: `${profile.firstName} ${profile.lastName}`,
                  gender: profile.gender,
                };
              }
            }

            const checkInDateStr = normalizeDate(activeReservation.checkInDate || activeReservation.startDate);
            const checkOutDateStr = normalizeDate(activeReservation.checkOutDate || activeReservation.endDate);

            if (reservation) {
              // Active reservation on selected date
              if (checkOutDateStr && checkOutDateStr <= selectedDate) {
                status = 'available';
                worker = undefined;
              } else {
                status = 'occupied';
              }
            } else if (futureReservation) {
              // Only future reservation exists
              status = 'available';
              hasFutureReservation = true;
            }
          }

          const displayReservation = reservation || futureReservation;
          return {
            id: bed.id,
            bedNumber: bed.bedNumber,
            status,
            worker: hasFutureReservation ? worker : status === 'occupied' ? worker : undefined,
            hasFutureReservation,
            checkInDate: displayReservation?.checkInDate || displayReservation?.startDate,
            checkOutDate: displayReservation?.checkOutDate || displayReservation?.endDate,
            expectedMoveOutDate: displayReservation?.checkOutDate || displayReservation?.endDate,
            expectedMoveInDate: displayReservation?.checkInDate || displayReservation?.startDate,
            reservationId: displayReservation?.id,
            roomNumber: room.roomNumber,
            houseName: house.name,
          };
        });

        // Room reservation info
        let roomReservationDetails = null;
        if (roomReservation) {
          const occupants = storage.get<RoomReservationOccupant>(
            STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS,
            mockRoomReservationOccupants
          ).filter((o) => o.roomReservationId === roomReservation.id);

          const leadTenant = roomReservation.leadEmploymentId
            ? (() => {
                const employment = employments.find((e) => e.id === roomReservation.leadEmploymentId);
                if (employment) {
                  const profile = workerProfiles.find((p) => p.id === employment.workerProfileId);
                  if (profile) {
                    return {
                      employmentId: employment.id,
                      name: `${profile.firstName} ${profile.lastName}`,
                    };
                  }
                }
                return null;
              })()
            : null;

          roomReservationDetails = {
            leadTenant,
            occupants: occupants.map((occ) => {
              if (occ.employmentId) {
                const employment = employments.find((e) => e.id === occ.employmentId);
                if (employment) {
                  const profile = workerProfiles.find((p) => p.id === employment.workerProfileId);
                  if (profile) {
                    return {
                      employmentId: employment.id,
                      name: `${profile.firstName} ${profile.lastName}`,
                      guestName: null,
                    };
                  }
                }
              }
              return {
                employmentId: null,
                name: occ.guestName || '',
                guestName: occ.guestName,
              };
            }),
            monthlyRate: roomReservation.monthlyRate,
            checkInDate: roomReservation.checkInDate || roomReservation.startDate,
          };
        }

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          canRentAsRoom: room.availableForRoomRental,
          useFloor: room.floor !== null && room.floor !== undefined,
          pricing: {
            useCustomPricing: (room.costPerDay !== null && room.costPerDay !== undefined) ||
              (room.costPerMonth !== null && room.costPerMonth !== undefined),
            roomDailyPrice: room.costPerDay ? parseFloat(room.costPerDay) : null,
            roomMonthlyPrice: room.costPerMonth ? parseFloat(room.costPerMonth) : null,
          },
          beds: bedsWithWorkers,
          roomReservation: roomReservationDetails,
        };
      });

      const totalBeds = roomsWithBeds.reduce((sum, room) => sum + room.beds.length, 0);
      const occupiedBeds = roomsWithBeds.reduce(
        (sum, room) => sum + room.beds.filter((b) => b.status === 'occupied').length,
        0
      );

      return {
        ...house,
        rooms: roomsWithBeds,
        totalBeds,
        occupiedBeds,
      };
    });
  },

  // POST /api/houses
  createHouse: async (data: {
    tenantId: string;
    name?: string;
    address: string;
    city?: string;
    country?: string;
    ownershipType?: string;
    rooms?: Array<{
      roomNumber: string;
      useFloor?: boolean;
      floor?: number;
      canRentAsRoom?: boolean;
      beds: number | Array<any>;
      pricing?: {
        useCustomPricing?: boolean;
        roomDailyPrice?: number;
        roomMonthlyPrice?: number;
      };
    }>;
  }) => {
    await delay(500);

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);

    const house: House = {
      id: generateId(),
      tenantId: data.tenantId,
      name: data.name || data.address,
      address: data.address,
      houseNumber: null,
      houseNumberAddition: null,
      postalCode: null,
      city: data.city || null,
      country: data.country || null,
      latitude: null,
      longitude: null,
      totalRooms: data.rooms?.length || 0,
      totalBeds: 0,
      costPerWeek: null,
      costPerBedPerDay: null,
      ownershipType: data.ownershipType === 'Kiralık' ? 'rent' : data.ownershipType === 'Mülk' ? 'owned' : 'rent',
      status: 'active',
      description: null,
      internalNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    houses.push(house);
    storage.set(STORAGE_KEYS.HOUSES, houses);

    // Create rooms and beds
    if (data.rooms && Array.isArray(data.rooms)) {
      for (const roomData of data.rooms) {
        const bedCount = Array.isArray(roomData.beds) ? roomData.beds.length : roomData.beds || 0;

        const room: Room = {
          id: generateId(),
          houseId: house.id,
          roomNumber: roomData.roomNumber || '',
          floor: roomData.useFloor ? roomData.floor || null : null,
          roomType: null,
          bedCount,
          genderRestriction: 'none',
          isFamilyRoom: false,
          availableForRoomRental: roomData.canRentAsRoom || false,
          status: 'active',
          costPerDay: roomData.pricing?.useCustomPricing ? String(roomData.pricing.roomDailyPrice || '') : null,
          costPerMonth: roomData.pricing?.useCustomPricing ? String(roomData.pricing.roomMonthlyPrice || '') : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        rooms.push(room);
        house.totalBeds += bedCount;

        // Create beds
        for (let i = 1; i <= bedCount; i++) {
          beds.push({
            id: generateId(),
            roomId: room.id,
            bedNumber: i,
            status: 'available',
            roomReservationId: null,
            lastOccupiedBy: null,
            lastOccupiedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    house.totalBeds = house.totalBeds;
    storage.set(STORAGE_KEYS.ROOMS, rooms);
    storage.set(STORAGE_KEYS.BEDS, beds);
    storage.set(STORAGE_KEYS.HOUSES, houses);

    // Return with rooms and beds
    return await mockApi.getHouses(data.tenantId).then((houses) => houses.find((h) => h.id === house.id)) || house;
  },

  // PATCH /api/houses/:id
  updateHouse: async (id: string, data: Partial<House & { rooms?: any[] }>) => {
    await delay(400);

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const index = houses.findIndex((h) => h.id === id);

    if (index === -1) {
      throw createError('House not found', 404);
    }

    const { rooms: roomsData, ...houseData } = data;

    houses[index] = {
      ...houses[index],
      ...houseData,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.HOUSES, houses);

    // Update rooms if provided
    if (roomsData) {
      const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
      const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);

      const existingRooms = rooms.filter((r) => r.houseId === id);
      const existingRoomIds = existingRooms.map((r) => r.id);
      const incomingRoomIds = roomsData.filter((r) => r.id).map((r) => r.id);

      // Delete removed rooms
      const roomsToDelete = existingRooms.filter((er) => !incomingRoomIds.includes(er.id));
      for (const room of roomsToDelete) {
        const roomBeds = beds.filter((b) => b.roomId === room.id);
        roomBeds.forEach((bed) => {
          const bedIndex = beds.findIndex((b) => b.id === bed.id);
          if (bedIndex !== -1) beds.splice(bedIndex, 1);
        });
        const roomIndex = rooms.findIndex((r) => r.id === room.id);
        if (roomIndex !== -1) rooms.splice(roomIndex, 1);
      }

      // Update or create rooms
      for (const roomData of roomsData) {
        if (roomData.id && existingRoomIds.includes(roomData.id)) {
          // Update existing room
          const roomIndex = rooms.findIndex((r) => r.id === roomData.id);
          if (roomIndex !== -1) {
            rooms[roomIndex] = {
              ...rooms[roomIndex],
              roomNumber: roomData.roomNumber || rooms[roomIndex].roomNumber,
              floor: roomData.useFloor ? roomData.floor : null,
              availableForRoomRental: roomData.canRentAsRoom !== undefined ? roomData.canRentAsRoom : rooms[roomIndex].availableForRoomRental,
              costPerDay: roomData.pricing?.useCustomPricing ? String(roomData.pricing.roomDailyPrice || '') : null,
              costPerMonth: roomData.pricing?.useCustomPricing ? String(roomData.pricing.roomMonthlyPrice || '') : null,
              updatedAt: new Date().toISOString(),
            };
          }
        } else {
          // Create new room
          const bedCount = Array.isArray(roomData.beds) ? roomData.beds.length : roomData.beds || 0;
          const newRoom: Room = {
            id: generateId(),
            houseId: id,
            roomNumber: roomData.roomNumber || '',
            floor: roomData.useFloor ? roomData.floor || null : null,
            roomType: null,
            bedCount,
            genderRestriction: 'none',
            isFamilyRoom: false,
            availableForRoomRental: roomData.canRentAsRoom || false,
            status: 'active',
            costPerDay: roomData.pricing?.useCustomPricing ? String(roomData.pricing.roomDailyPrice || '') : null,
            costPerMonth: roomData.pricing?.useCustomPricing ? String(roomData.pricing.roomMonthlyPrice || '') : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          rooms.push(newRoom);

          // Create beds
          for (let i = 1; i <= bedCount; i++) {
            beds.push({
              id: generateId(),
              roomId: newRoom.id,
              bedNumber: i,
              status: 'available',
              roomReservationId: null,
              lastOccupiedBy: null,
              lastOccupiedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      storage.set(STORAGE_KEYS.ROOMS, rooms);
      storage.set(STORAGE_KEYS.BEDS, beds);
    }

    return await mockApi.getHouses(houses[index].tenantId).then((houses) => houses.find((h) => h.id === id)) || houses[index];
  },

  // DELETE /api/houses/:id
  deleteHouse: async (id: string) => {
    await delay(300);

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const index = houses.findIndex((h) => h.id === id);

    if (index === -1) {
      throw createError('House not found', 404);
    }

    // Delete rooms and beds
    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);

    const houseRooms = rooms.filter((r) => r.houseId === id);
    for (const room of houseRooms) {
      const roomBeds = beds.filter((b) => b.roomId === room.id);
      roomBeds.forEach((bed) => {
        const bedIndex = beds.findIndex((b) => b.id === bed.id);
        if (bedIndex !== -1) beds.splice(bedIndex, 1);
      });
      const roomIndex = rooms.findIndex((r) => r.id === room.id);
      if (roomIndex !== -1) rooms.splice(roomIndex, 1);
    }

    houses.splice(index, 1);

    storage.set(STORAGE_KEYS.HOUSES, houses);
    storage.set(STORAGE_KEYS.ROOMS, rooms);
    storage.set(STORAGE_KEYS.BEDS, beds);

    return { success: true };
  },

  // GET /api/houses/:houseId/availability-conflicts
  getAvailabilityConflicts: async (houseId: string, startDate: string, endDate?: string) => {
    await delay(250);

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const house = houses.find((h) => h.id === houseId);

    if (!house) {
      throw createError('House not found', 404);
    }

    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);
    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);

    const houseRooms = rooms.filter((r) => r.houseId === houseId);

    const roomsWithConflicts = houseRooms.map((room) => {
      const roomBeds = beds.filter((b) => b.roomId === room.id);

      const bedsWithConflicts = roomBeds.map((bed) => {
        // Only check checked_in reservations (active reservations)
        const bedReservations = reservations.filter((r) => r.bedId === bed.id && r.status === 'checked_in');

        const conflicts = bedReservations.filter((res) => {
          const resStart = res.checkInDate || res.startDate;
          const resEnd = res.checkOutDate || res.endDate;

          if (!resStart) return false;

          // Check if reservation overlaps with requested date range
          if (endDate) {
            // Check overlap: requested range overlaps with reservation range
            // Overlap occurs when: startDate <= resEnd && endDate >= resStart
            // But need to handle null endDate (open-ended reservation)
            if (!resEnd) {
              // Open-ended reservation: conflicts if it starts before or on our endDate
              return resStart <= endDate;
            } else {
              // Both have end dates: check overlap
              return startDate <= resEnd && endDate >= resStart;
            }
          } else {
            // No endDate specified: check if reservation is active on startDate
            // Active if: resStart <= startDate && (!resEnd || resEnd >= startDate)
            if (!resEnd) {
              // Open-ended reservation: active if it starts on or before our startDate
              return resStart <= startDate;
            } else {
              // Reservation with end date: active if it covers our startDate
              return resStart <= startDate && resEnd >= startDate;
            }
          }
        });

        return {
          id: bed.id,
          bedNumber: bed.bedNumber,
          status: bed.status,
          availability: {
            available: conflicts.length === 0,
            conflictType: conflicts.length > 0 ? ('full' as const) : ('none' as const),
            conflicts: conflicts.map((c) => ({
              reservationId: c.id,
              checkInDate: c.checkInDate || c.startDate,
              checkOutDate: c.checkOutDate || c.endDate,
              employmentId: c.employmentId,
              workerName: 'Worker Name', // Would need to lookup
            })),
          },
        };
      });

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        beds: bedsWithConflicts,
      };
    });

    return {
      houseId,
      houseName: house.name,
      startDate,
      endDate: endDate || null,
      rooms: roomsWithConflicts,
    };
  },

  // ============================================
  // RESERVATIONS / CHECK-IN/OUT API
  // ============================================

  // POST /api/beds/:bedId/check-in
  checkInBed: async (bedId: string, data: {
    employmentId: string;
    startDate: string;
    endDate?: string;
    checkInDate?: string;
    tenantId: string;
    monthlyRate?: number;
    depositAmount?: number;
    depositCollected?: boolean;
    depositCollector?: string;
  }) => {
    await delay(400);

    console.log(`[MOCK API] checkInBed called with bedId: ${bedId}`, data);

    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);
    console.log(`[MOCK API] Total beds in storage: ${beds.length}`);
    console.log(`[MOCK API] Available bed IDs:`, beds.map(b => b.id).slice(0, 10));
    
    const bed = beds.find((b) => b.id === bedId);

    if (!bed) {
      console.error(`[MOCK API] Bed not found: ${bedId}`);
      console.error(`[MOCK API] Available bed IDs:`, beds.map(b => b.id));
      throw createError(`Bed not found: ${bedId}. Available beds: ${beds.length}`, 404);
    }

    console.log(`[MOCK API] Bed found: ${bed.id}, roomId: ${bed.roomId}`);

    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    console.log(`[MOCK API] Total rooms in storage: ${rooms.length}`);
    console.log(`[MOCK API] Available room IDs:`, rooms.map(r => r.id).slice(0, 10));
    
    const room = rooms.find((r) => r.id === bed.roomId);
    if (!room) {
      console.error(`[MOCK API] Room not found for bed ${bedId}, roomId: ${bed.roomId}`);
      console.error(`[MOCK API] Available room IDs:`, rooms.map(r => r.id));
      throw createError(`Room not found: ${bed.roomId} (for bed ${bedId})`, 404);
    }

    console.log(`[MOCK API] Room found: ${room.id}, houseId: ${room.houseId}`);

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const house = houses.find((h) => h.id === room.houseId);
    if (!house) throw createError('House not found', 404);

    // Check if bed already has active reservation for the requested date range
    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    
    // Normalize dates to YYYY-MM-DD format for comparison
    const normalizeDate = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null;
      if (dateStr.includes('T') || dateStr.includes('Z')) {
        return dateStr.split('T')[0];
      }
      return dateStr;
    };

    const reqStartDate = normalizeDate(data.startDate);
    const reqEndDate = normalizeDate(data.endDate || null);
    
    // Find conflicting reservations (active reservations that overlap with requested dates)
    const conflictingReservations = reservations.filter((r) => {
      if (r.bedId !== bedId || r.status !== 'checked_in') return false;
      
      const resStart = normalizeDate(r.checkInDate || r.startDate);
      const resEnd = normalizeDate(r.checkOutDate || r.endDate);
      
      if (!resStart || !reqStartDate) return false;

      // Check if reservation overlaps with requested date range
      if (reqEndDate) {
        if (!resEnd) {
          // Open-ended reservation: conflicts if it starts before or on our endDate
          return resStart <= reqEndDate;
        } else {
          // Both have end dates: check overlap
          return reqStartDate <= resEnd && reqEndDate >= resStart;
        }
      } else {
        // No request endDate specified: check if reservation is active on reqStartDate
        if (!resEnd) {
          // Open-ended reservation: active if it starts on or before our reqStartDate
          return resStart <= reqStartDate;
        } else {
          // Reservation with end date: active if it covers our reqStartDate
          return resStart <= reqStartDate && resEnd >= reqStartDate;
        }
      }
    });

    if (conflictingReservations.length > 0) {
      throw createError('Bed already has an active reservation for the requested date range', 400);
    }

    // Create reservation
    const reservation: Reservation = {
      id: generateId(),
      employmentId: data.employmentId,
      houseId: house.id,
      roomId: room.id,
      bedId: bedId,
      tenantId: data.tenantId,
      startDate: data.startDate,
      endDate: data.endDate || null,
      checkInDate: data.checkInDate || data.startDate,
      checkOutDate: null,
      status: 'checked_in',
      dailyRate: null,
      totalCost: null,
      onVacation: false,
      belongingsInRoom: true,
      description: null,
      internalNotes: null,
      notes: [],
      confirmedBy: null,
      confirmedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
    };
    reservations.push(reservation);
    storage.set(STORAGE_KEYS.RESERVATIONS, reservations);

    // Create assignment
    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const assignment: Assignment = {
      id: generateId(),
      tenantId: data.tenantId,
      employmentId: data.employmentId,
      houseId: house.id,
      roomId: room.id,
      bedId: bedId,
      startDate: data.startDate,
      endDate: data.endDate || null,
      monthlyRate: String(data.monthlyRate || 600),
      status: 'active',
      depositCollected: data.depositCollected || false,
      depositAmount: String(data.depositAmount || 0),
      depositDate: data.depositCollected ? data.startDate : null,
      depositCollector: data.depositCollector || null,
      depositStatus: data.depositCollected ? 'collected' : 'pending',
      depositRefundDate: null,
      depositRefundAmount: null,
      damageAmount: null,
      damageNote: null,
      agreementNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
    };
    assignments.push(assignment);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    // Update bed status
    bed.status = 'occupied';
    bed.lastOccupiedBy = data.employmentId;
    bed.lastOccupiedAt = new Date().toISOString();
    bed.updatedAt = new Date().toISOString();
    storage.set(STORAGE_KEYS.BEDS, beds);

    return { reservation, assignment };
  },

  // POST /api/rooms/:roomId/check-in
  checkInRoom: async (roomId: string, data: {
    leadEmploymentId?: string;
    occupants: Array<{
      employmentId?: string;
      guestName?: string;
      guestGender?: 'male' | 'female';
      notes?: string;
    }>;
    startDate: string;
    endDate?: string;
    checkInDate?: string;
    tenantId: string;
    monthlyRate?: number;
    depositAmount?: number;
    depositCollected?: boolean;
    depositCollector?: string;
  }) => {
    await delay(500);

    console.log(`[MOCK API] checkInRoom called with roomId: ${roomId}`, data);

    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    console.log(`[MOCK API] Total rooms in storage: ${rooms.length}`);
    console.log(`[MOCK API] Available room IDs:`, rooms.map(r => r.id).slice(0, 10));
    
    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      console.error(`[MOCK API] Room not found: ${roomId}`);
      console.error(`[MOCK API] Available room IDs:`, rooms.map(r => r.id));
      throw createError(`Room not found: ${roomId}. Available rooms: ${rooms.length}`, 404);
    }

    console.log(`[MOCK API] Room found: ${room.id}, houseId: ${room.houseId}`);

    if (!room.availableForRoomRental) {
      throw createError('This room is not available for whole-room rental', 400);
    }

    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const house = houses.find((h) => h.id === room.houseId);
    if (!house) throw createError('House not found', 404);

    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);
    const roomBeds = beds.filter((b) => b.roomId === roomId);

    // Check if room already has active room reservation
    const roomReservations = storage.get<RoomReservation>(STORAGE_KEYS.ROOM_RESERVATIONS, mockRoomReservations);
    const existingRoomReservation = roomReservations.find((rr) => rr.roomId === roomId && rr.status === 'active');

    if (existingRoomReservation) {
      throw createError('Bu oda zaten oda olarak kiralanmış', 400);
    }

    // Create room reservation
    const roomReservation: RoomReservation = {
      id: generateId(),
      tenantId: data.tenantId,
      houseId: house.id,
      roomId: roomId,
      leadEmploymentId: data.leadEmploymentId || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      checkInDate: data.checkInDate || data.startDate,
      checkOutDate: null,
      status: 'active',
      monthlyRate: data.monthlyRate ? String(data.monthlyRate) : null,
      dailyRate: null,
      totalCost: null,
      depositAmount: data.depositAmount ? String(data.depositAmount) : null,
      depositCollected: data.depositCollected || false,
      depositDate: data.depositCollected ? data.startDate : null,
      description: null,
      internalNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      createdBy: null,
    };
    roomReservations.push(roomReservation);
    storage.set(STORAGE_KEYS.ROOM_RESERVATIONS, roomReservations);

    // Create occupants
    const occupants = storage.get<RoomReservationOccupant>(STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS, mockRoomReservationOccupants);
    const occupantRecords = data.occupants.map((occ) => ({
      id: generateId(),
      roomReservationId: roomReservation.id,
      employmentId: occ.employmentId || null,
      guestName: occ.guestName || null,
      guestGender: occ.guestGender || null,
      notes: occ.notes || null,
      createdAt: new Date().toISOString(),
    }));
    occupants.push(...occupantRecords);
    storage.set(STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS, occupants);

    // Update all beds
    roomBeds.forEach((bed) => {
      bed.roomReservationId = roomReservation.id;
      bed.status = 'occupied';
      bed.updatedAt = new Date().toISOString();
    });
    storage.set(STORAGE_KEYS.BEDS, beds);

    return {
      roomReservation,
      occupants: occupantRecords,
      bedsUpdated: roomBeds.length,
      message: `Oda başarıyla kiralandı - ${roomBeds.length} yatak ${occupantRecords.length} kişi için rezerve edildi`,
    };
  },

  // GET /api/beds/:bedId/future-reservations
  getFutureReservations: async (bedId: string, afterDate: string) => {
    await delay(200);

    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    return reservations.filter((r) => {
      if (r.bedId !== bedId) return false;
      const startDate = r.checkInDate || r.startDate;
      return startDate && startDate > afterDate;
    });
  },

  // GET /api/reservations
  getReservations: async (tenantId: string, bedId?: string, active?: string) => {
    await delay(200);

    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    let filtered = reservations.filter((r) => r.tenantId === tenantId);

    if (bedId) {
      filtered = filtered.filter((r) => r.bedId === bedId);
    }

    if (active === 'true') {
      filtered = filtered.filter((r) => r.status === 'checked_in');
    }

    return filtered;
  },

  // PATCH /api/reservations/:id/check-out
  checkOutReservation: async (id: string, data: {
    checkOutDate: string;
    checkOutType?: string;
    notes?: string;
    vacationStart?: string;
    vacationEnd?: string;
  }) => {
    await delay(300);

    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    const index = reservations.findIndex((r) => r.id === id);

    if (index === -1) {
      throw createError('Reservation not found', 404);
    }

    const existingNotes = reservations[index].notes || [];
    const newNotes = [...existingNotes];

    if (data.notes) {
      newNotes.push(`[${data.checkOutType || 'checkout'}] ${data.notes}`);
    }

    if (data.checkOutType === 'vacation' && data.vacationStart && data.vacationEnd) {
      newNotes.push(`Vacation: ${data.vacationStart} to ${data.vacationEnd}`);
    }

    reservations[index] = {
      ...reservations[index],
      checkOutDate: data.checkOutDate,
      notes: newNotes,
      status: 'checked_out',
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.RESERVATIONS, reservations);

    // Update bed status
    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);
    const bed = beds.find((b) => b.id === reservations[index].bedId);
    if (bed) {
      bed.status = 'available';
      bed.updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.BEDS, beds);
    }

    return reservations[index];
  },

  // POST /api/reservations/:id/notes
  addReservationNote: async (id: string, data: { note: string }) => {
    await delay(200);

    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    const index = reservations.findIndex((r) => r.id === id);

    if (index === -1) {
      throw createError('Reservation not found', 404);
    }

    const timestamp = new Date().toISOString();
    const existingNotes = reservations[index].notes || [];
    const newNote = `[${timestamp}] ${data.note}`;

    reservations[index] = {
      ...reservations[index],
      notes: [...existingNotes, newNote],
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.RESERVATIONS, reservations);

    return reservations[index];
  },

  // GET /api/reservations/:id/notes
  getReservationNotes: async (id: string) => {
    await delay(150);

    const reservations = storage.get<Reservation>(STORAGE_KEYS.RESERVATIONS, mockReservations);
    const reservation = reservations.find((r) => r.id === id);

    if (!reservation) {
      throw createError('Reservation not found', 404);
    }

    return { notes: reservation.notes || [] };
  },

  // ============================================
  // QR CODES API
  // ============================================

  // GET /api/qr-codes
  getQRCodes: async (tenantId: string) => {
    await delay(200);

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    // Sadece worker_registration tipindeki QR kodları döndür (document_upload ve meter_reading kaldırıldı)
    return qrCodes.filter((qr) => qr.tenantId === tenantId && qr.type === 'worker_registration');
  },

  // POST /api/qr-codes
  createQRCode: async (data: {
    tenantId: string;
    type: 'worker_registration' | 'meter_reading' | 'document_upload';
    code: string;
    title: string;
    status?: 'active' | 'disabled' | 'expired';
    usageLimit?: number;
    expiryDate?: string;
  }) => {
    await delay(300);

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);

    // Check if code already exists
    if (qrCodes.find((qr) => qr.code === data.code)) {
      throw createError('QR code already exists', 400);
    }

    const qrCode: QRCode = {
      id: generateId(),
      tenantId: data.tenantId,
      type: data.type,
      code: data.code,
      title: data.title,
      status: data.status || 'active',
      usageLimit: data.usageLimit || null,
      usedCount: 0,
      expiryDate: data.expiryDate || null,
      createdAt: new Date().toISOString(),
      createdBy: null,
    };

    qrCodes.push(qrCode);
    storage.set(STORAGE_KEYS.QR_CODES, qrCodes);

    return qrCode;
  },

  // PATCH /api/qr-codes/:id
  updateQRCode: async (id: string, data: Partial<QRCode>) => {
    await delay(250);

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    const index = qrCodes.findIndex((qr) => qr.id === id);

    if (index === -1) {
      throw createError('QR code not found', 404);
    }

    qrCodes[index] = {
      ...qrCodes[index],
      ...data,
    };
    storage.set(STORAGE_KEYS.QR_CODES, qrCodes);

    return qrCodes[index];
  },

  // DELETE /api/qr-codes/:id
  deleteQRCode: async (id: string) => {
    await delay(200);

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    const index = qrCodes.findIndex((qr) => qr.id === id);

    if (index === -1) {
      throw createError('QR code not found', 404);
    }

    qrCodes.splice(index, 1);
    storage.set(STORAGE_KEYS.QR_CODES, qrCodes);

    return { success: true };
  },

  // POST /api/qr-codes/:code/use
  useQRCode: async (code: string) => {
    await delay(200);

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    const qrCode = qrCodes.find((qr) => qr.code === code);

    if (!qrCode) {
      throw createError('QR code not found', 404);
    }

    if (qrCode.status !== 'active') {
      throw createError('QR code is not active', 400);
    }

    if (qrCode.usageLimit !== null && qrCode.usedCount >= qrCode.usageLimit) {
      throw createError('QR code usage limit reached', 400);
    }

    qrCode.usedCount += 1;
    storage.set(STORAGE_KEYS.QR_CODES, qrCodes);

    return qrCode;
  },

  // ============================================
  // GUEST REGISTRATION API
  // ============================================

  // GET /api/qr-codes/:code
  getQRCodeByCode: async (code: string) => {
    await delay(150);

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    const qrCode = qrCodes.find((qr) => qr.code === code);

    if (!qrCode) {
      throw createError('QR code not found', 404);
    }

    return qrCode;
  },

  // GET /api/qr-codes/:code/validate
  validateQRCode: async (code: string) => {
    await delay(200);

    try {
      const qrCode = await mockApi.getQRCodeByCode(code);
      const guestRequests = storage.get<GuestRegistrationRequest>(
        STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS,
        mockGuestRegistrationRequests
      );
      const existingRequest = guestRequests.find((req) => req.qrCode === code) || null;

      const now = new Date();
      let reason: string | null = null;

      if (qrCode.status !== 'active') {
        reason = 'status';
      } else if (qrCode.expiryDate && new Date(qrCode.expiryDate) < now) {
        reason = 'expired';
      } else if (qrCode.usageLimit !== null) {
        // usageLimit varsa, usedCount kontrolü yap
        // Number olarak karşılaştır (string olma ihtimaline karşı)
        const usedCount = typeof qrCode.usedCount === 'number' ? qrCode.usedCount : parseInt(String(qrCode.usedCount || 0));
        const usageLimit = typeof qrCode.usageLimit === 'number' ? qrCode.usageLimit : parseInt(String(qrCode.usageLimit));
        if (usedCount >= usageLimit) {
          reason = 'limit';
        }
      }
      
      // 1 kerelik QR kodlar için ekstra kontrol: existing request kontrolü
      // Bu kontrol, usedCount kontrolünden sonra yapılmalı (çünkü usedCount kontrolü zaten limit'i kontrol ediyor)
      // Ama bazen usedCount henüz güncellenmemiş olabilir, bu yüzden existing request kontrolü de yapılıyor
      if (reason === null && qrCode.usageLimit === 1 && existingRequest && existingRequest.status !== 'REJECTED') {
        // Sadece 1 kerelik QR kodlar için existing request kontrolü yap
        // REJECTED request'ler için tekrar kullanım izni ver (reddedilen request'ler için yeni request oluşturulabilir)
        // Sınırsız veya çoklu kullanım için her seferinde yeni request oluşturulabilir
        const requestReasonMap: Record<GuestRegistrationRequest['status'], string> = {
          PENDING: 'pending_request',
          APPROVED: 'already_used',
          REJECTED: 'rejected_request',
        };
        reason = requestReasonMap[existingRequest.status];
      }

      return {
        valid: reason === null,
        reason,
        qrCode,
        existingRequest,
      };
    } catch (error: any) {
      // QR kod bulunamadıysa
      if (error.status === 404) {
        return {
          valid: false,
          reason: 'not_found',
          qrCode: null,
          existingRequest: null,
        };
      }
      // Diğer hatalar için
      throw error;
    }
  },

  // POST /api/guest-registration-requests
  createGuestRegistrationRequest: async (data: {
    qrCode: string;
    fullName: string;
    country: string;
    phone: string;
    email: string;
    visitStartDate: string;
    visitEndDate: string;
    apartment?: string | null;
    notes?: string | null;
    gender?: WorkerGender | null;
  }) => {
    await delay(300);

    const qrCode = await mockApi.getQRCodeByCode(data.qrCode);

    if (qrCode.type !== 'worker_registration') {
      throw createError('This QR code is not configured for guest registration', 400);
    }

    if (new Date(data.visitEndDate) < new Date(data.visitStartDate)) {
      throw createError('Visit end date must be later than start date', 400);
    }

    const guestRequests = storage.get<GuestRegistrationRequest>(
      STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS,
      mockGuestRegistrationRequests
    );

    // Sadece 1 kerelik QR kodlar için existing request kontrolü yap
    // Sınırsız veya çoklu kullanım için her seferinde yeni request oluşturulabilir
    if (qrCode.usageLimit === 1) {
      const existingRequest = guestRequests.find((req) => req.qrCode === data.qrCode);
      if (existingRequest && existingRequest.status !== 'REJECTED') {
        // REJECTED request'ler için yeni request oluşturulabilir
        const statusMessages: Record<GuestRegistrationRequest['status'], string> = {
          PENDING: 'Request already submitted and pending review',
          APPROVED: 'This QR code has already been approved',
          REJECTED: 'This QR code has already been reviewed',
        };
        throw createError(statusMessages[existingRequest.status], 400);
      }
    }

    const now = new Date().toISOString();
    const request: GuestRegistrationRequest = {
      id: generateId(),
      qrCodeId: qrCode.id,
      tenantId: qrCode.tenantId,
      qrCode: data.qrCode,
      fullName: data.fullName,
      country: data.country,
      phone: data.phone,
      email: data.email,
      gender: data.gender || null,
      visitStartDate: data.visitStartDate,
      visitEndDate: data.visitEndDate,
      apartment: data.apartment || null,
      notes: data.notes || null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    guestRequests.push(request);
    storage.set(STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS, guestRequests);

    // QR kod kullanım sayısını artır
    // Not: REJECTED request'ler için usedCount artırılmaz (çünkü reddedilmiş request'ler için tekrar kullanım izni var)
    // Ama 1 kerelik QR kodlar için zaten existing request kontrolü yapıldı, bu yüzden buraya gelen request'ler için artırılabilir
    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    const qrIndex = qrCodes.findIndex((qr) => qr.code === data.qrCode);
    if (qrIndex !== -1) {
      qrCodes[qrIndex].usedCount += 1;
      storage.set(STORAGE_KEYS.QR_CODES, qrCodes);
    }

    return request;
  },

  // GET /api/guest-registration-requests/by-code/:qrCode
  getGuestRegistrationRequestByQRCode: async (qrCodeValue: string) => {
    await delay(150);

    const guestRequests = storage.get<GuestRegistrationRequest>(
      STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS,
      mockGuestRegistrationRequests
    );

    return guestRequests.find((req) => req.qrCode === qrCodeValue) || null;
  },

  // GET /api/guest-registration-requests/pending
  getPendingGuestRegistrationRequests: async (tenantId?: string) => {
    await delay(200);

    const guestRequests = storage.get<GuestRegistrationRequest>(
      STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS,
      mockGuestRegistrationRequests
    );

    return guestRequests.filter(
      (req) => req.status === 'PENDING' && (!tenantId || req.tenantId === tenantId)
    );
  },

  // POST /api/guest-registration-requests/:id/approve
  approveGuestRegistrationRequest: async (id: string) => {
    await delay(300);

    const guestRequests = storage.get<GuestRegistrationRequest>(
      STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS,
      mockGuestRegistrationRequests
    );
    const requestIndex = guestRequests.findIndex((req) => req.id === id);

    if (requestIndex === -1) {
      throw createError('Guest registration request not found', 404);
    }

    const request = guestRequests[requestIndex];
    if (request.status !== 'PENDING') {
      throw createError('Guest registration request already processed', 400);
    }

    const qrCodes = storage.get<QRCode>(STORAGE_KEYS.QR_CODES, mockQRCodes);
    const qrIndex = qrCodes.findIndex((qr) => qr.id === request.qrCodeId);
    if (qrIndex === -1) {
      throw createError('QR code not found', 404);
    }

    const nameParts = request.fullName.trim().split(' ');
    const firstName = nameParts.shift() || request.fullName;
    const lastName = nameParts.length > 0 ? nameParts.join(' ') : firstName;

    await mockApi.createWorker({
      tenantId: request.tenantId,
      email: request.email,
      firstName,
      lastName,
      gender: request.gender || 'male',
      phone: request.phone,
      nationality: request.country,
      startDate: request.visitStartDate,
    });

    guestRequests[requestIndex] = {
      ...request,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS, guestRequests);

    qrCodes[qrIndex] = {
      ...qrCodes[qrIndex],
      usedCount: qrCodes[qrIndex].usedCount + 1,
    };
    storage.set(STORAGE_KEYS.QR_CODES, qrCodes);

    return guestRequests[requestIndex];
  },

  // POST /api/guest-registration-requests/:id/reject
  rejectGuestRegistrationRequest: async (id: string) => {
    await delay(200);

    const guestRequests = storage.get<GuestRegistrationRequest>(
      STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS,
      mockGuestRegistrationRequests
    );
    const requestIndex = guestRequests.findIndex((req) => req.id === id);

    if (requestIndex === -1) {
      throw createError('Guest registration request not found', 404);
    }

    if (guestRequests[requestIndex].status !== 'PENDING') {
      throw createError('Guest registration request already processed', 400);
    }

    guestRequests[requestIndex] = {
      ...guestRequests[requestIndex],
      status: 'REJECTED',
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.GUEST_REGISTRATION_REQUESTS, guestRequests);

    return guestRequests[requestIndex];
  },

  // ============================================
  // ASSIGNMENT MANAGEMENT API
  // ============================================

  // GET /api/tenants/:tenantId/assignments
  getAssignments: async (tenantId: string) => {
    await delay(250);

    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);
    const houses = storage.get<House>(STORAGE_KEYS.HOUSES, mockHouses);
    const rooms = storage.get<Room>(STORAGE_KEYS.ROOMS, mockRooms);
    const beds = storage.get<Bed>(STORAGE_KEYS.BEDS, mockBeds);
    const roomReservations = storage.get<RoomReservation>(STORAGE_KEYS.ROOM_RESERVATIONS, mockRoomReservations);
    const roomReservationOccupants = storage.get<RoomReservationOccupant>(STORAGE_KEYS.ROOM_RESERVATION_OCCUPANTS, mockRoomReservationOccupants);

    return assignments
      .filter((a) => a.tenantId === tenantId)
      .map((assignment) => {
        const employment = employments.find((e) => e.id === assignment.employmentId);
        const profile = employment ? workerProfiles.find((p) => p.id === employment.workerProfileId) : null;
        const house = houses.find((h) => h.id === assignment.houseId);
        const room = rooms.find((r) => r.id === assignment.roomId);
        const bed = beds.find((b) => b.id === assignment.bedId);

        // Check if this bed is part of a room reservation
        const roomReservation = bed?.roomReservationId 
          ? roomReservations.find((rr) => rr.id === bed.roomReservationId && rr.status === 'active')
          : null;

        let isRoomReservation = false;
        let occupants: Array<{ employmentId: string | null; name: string; guestName: string | null }> = [];

        if (roomReservation) {
          isRoomReservation = true;
          const occupantsData = roomReservationOccupants.filter(
            (occ) => occ.roomReservationId === roomReservation.id
          );

          occupants = occupantsData.map((occ) => {
            if (occ.employmentId) {
              const occEmployment = employments.find((e) => e.id === occ.employmentId);
              const occProfile = occEmployment 
                ? workerProfiles.find((p) => p.id === occEmployment.workerProfileId) 
                : null;
              return {
                employmentId: occ.employmentId,
                name: occProfile ? `${occProfile.firstName} ${occProfile.lastName}` : 'Unknown',
                guestName: occ.guestName,
              };
            }
            return {
              employmentId: null,
              name: occ.guestName || 'Unknown',
              guestName: occ.guestName,
            };
          });
        }

        return {
          ...assignment,
          workerName: profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown',
          houseName: house?.name || 'Unknown',
          roomNumber: room?.roomNumber || 'Unknown',
          bedNumber: bed?.bedNumber || 0,
          isRoomReservation,
          roomReservationId: roomReservation?.id || null,
          occupants,
        };
      });
  },

  // GET /api/assignments/:id
  getAssignment: async (id: string) => {
    await delay(200);

    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const assignment = assignments.find((a) => a.id === id);

    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    return assignment;
  },

  // POST /api/tenants/:tenantId/assignments
  createAssignment: async (tenantId: string, data: Partial<Assignment>) => {
    await delay(300);

    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const assignment: Assignment = {
      id: generateId(),
      tenantId,
      employmentId: data.employmentId!,
      houseId: data.houseId!,
      roomId: data.roomId!,
      bedId: data.bedId!,
      startDate: data.startDate!,
      endDate: data.endDate || null,
      monthlyRate: data.monthlyRate || '600',
      status: data.status || 'active',
      depositCollected: data.depositCollected || false,
      depositAmount: data.depositAmount || '0',
      depositDate: data.depositDate || null,
      depositCollector: data.depositCollector || null,
      depositStatus: data.depositStatus || 'pending',
      depositRefundDate: null,
      depositRefundAmount: null,
      damageAmount: null,
      damageNote: null,
      agreementNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      createdBy: null,
    };

    assignments.push(assignment);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    return assignment;
  },

  // PATCH /api/assignments/:id
  updateAssignment: async (id: string, data: Partial<Assignment>) => {
    await delay(300);

    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const index = assignments.findIndex((a) => a.id === id);

    if (index === -1) {
      throw createError('Assignment not found', 404);
    }

    assignments[index] = {
      ...assignments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    return assignments[index];
  },

  // DELETE /api/assignments/:id
  deleteAssignment: async (id: string) => {
    await delay(200);

    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const index = assignments.findIndex((a) => a.id === id);

    if (index === -1) {
      throw createError('Assignment not found', 404);
    }

    assignments.splice(index, 1);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    return { success: true };
  },

  // GET /api/tenants/:tenantId/assignments/:assignmentId/notes
  getAssignmentNotes: async (assignmentId: string) => {
    await delay(200);

    const notes = storage.get<AssignmentNote>(STORAGE_KEYS.ASSIGNMENT_NOTES, mockAssignmentNotes);
    return notes.filter((n) => n.assignmentId === assignmentId);
  },

  // POST /api/tenants/:tenantId/assignments/:assignmentId/notes
  createAssignmentNote: async (tenantId: string, assignmentId: string, data: { note: string }) => {
    await delay(200);

    const notes = storage.get<AssignmentNote>(STORAGE_KEYS.ASSIGNMENT_NOTES, mockAssignmentNotes);
    const note: AssignmentNote = {
      id: generateId(),
      tenantId,
      assignmentId,
      note: data.note,
      createdBy: 'user-001', // Mock user ID
      createdAt: new Date().toISOString(),
    };

    notes.push(note);
    storage.set(STORAGE_KEYS.ASSIGNMENT_NOTES, notes);

    return note;
  },

  // ============================================
  // CHARGES API
  // ============================================

  // GET /api/tenants/:tenantId/charges
  getCharges: async (tenantId: string) => {
    await delay(200);

    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);

    return charges
      .filter((c) => c.tenantId === tenantId)
      .map((charge) => {
        const assignment = assignments.find((a) => a.id === charge.assignmentId);
        const employment = assignment ? employments.find((e) => e.id === assignment.employmentId) : null;
        const profile = employment ? workerProfiles.find((p) => p.id === employment.workerProfileId) : null;

        return {
          ...charge,
          workerName: profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown',
        };
      });
  },

  // GET /api/charges/:id
  getCharge: async (id: string) => {
    await delay(200);

    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const charge = charges.find((c) => c.id === id);

    if (!charge) {
      throw createError('Charge not found', 404);
    }

    return charge;
  },

  // POST /api/tenants/:tenantId/charges
  createCharge: async (tenantId: string, data: Partial<Charge>) => {
    await delay(300);

    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const charge: Charge = {
      id: generateId(),
      tenantId,
      assignmentId: data.assignmentId!,
      month: data.month!,
      amount: data.amount!,
      expectedAmount: data.expectedAmount!,
      remainingAmount: data.remainingAmount!,
      days: data.days!,
      calculationType: data.calculationType!,
      dueDate: data.dueDate!,
      status: data.status || 'pending',
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    charges.push(charge);
    storage.set(STORAGE_KEYS.CHARGES, charges);

    return charge;
  },

  // PATCH /api/charges/:id
  updateCharge: async (id: string, data: Partial<Charge>) => {
    await delay(250);

    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const index = charges.findIndex((c) => c.id === id);

    if (index === -1) {
      throw createError('Charge not found', 404);
    }

    charges[index] = {
      ...charges[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.CHARGES, charges);

    return charges[index];
  },

  // DELETE /api/charges/:id
  deleteCharge: async (id: string) => {
    await delay(200);

    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const index = charges.findIndex((c) => c.id === id);

    if (index === -1) {
      throw createError('Charge not found', 404);
    }

    charges.splice(index, 1);
    storage.set(STORAGE_KEYS.CHARGES, charges);

    return { success: true };
  },

  // ============================================
  // PAYMENTS API
  // ============================================

  // GET /api/tenants/:tenantId/payments
  getPayments: async (tenantId: string) => {
    await delay(200);

    const payments = storage.get<Payment>(STORAGE_KEYS.PAYMENTS, mockPayments);
    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const assignments = storage.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS, mockAssignments);
    const employments = storage.get<Employment>(STORAGE_KEYS.EMPLOYMENTS, mockEmployments);
    const workerProfiles = storage.get<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES, mockWorkerProfiles);

    return payments
      .filter((p) => p.tenantId === tenantId)
      .map((payment) => {
        const charge = charges.find((c) => c.id === payment.chargeId);
        const assignment = charge ? assignments.find((a) => a.id === charge.assignmentId) : null;
        const employment = assignment ? employments.find((e) => e.id === assignment.employmentId) : null;
        const profile = employment ? workerProfiles.find((p) => p.id === employment.workerProfileId) : null;

        return {
          ...payment,
          workerName: profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown',
        };
      });
  },

  // GET /api/payments/:id
  getPayment: async (id: string) => {
    await delay(200);

    const payments = storage.get<Payment>(STORAGE_KEYS.PAYMENTS, mockPayments);
    const payment = payments.find((p) => p.id === id);

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    return payment;
  },

  // POST /api/tenants/:tenantId/payments
  createPayment: async (tenantId: string, data: Partial<Payment>) => {
    await delay(300);

    const payments = storage.get<Payment>(STORAGE_KEYS.PAYMENTS, mockPayments);
    const payment: Payment = {
      id: generateId(),
      tenantId,
      chargeId: data.chargeId!,
      amount: data.amount!,
      paymentDate: data.paymentDate!,
      paymentMethod: data.paymentMethod!,
      collectorName: data.collectorName || null,
      recordedAt: new Date().toISOString(),
      reference: data.reference || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      createdBy: null,
    };

    payments.push(payment);
    storage.set(STORAGE_KEYS.PAYMENTS, payments);

    // Update charge remaining amount
    const charges = storage.get<Charge>(STORAGE_KEYS.CHARGES, mockCharges);
    const charge = charges.find((c) => c.id === data.chargeId);
    if (charge) {
      const remaining = parseFloat(charge.remainingAmount) - parseFloat(data.amount!);
      charge.remainingAmount = String(Math.max(0, remaining));
      charge.status = remaining <= 0 ? 'paid' : charge.status === 'pending' ? 'partial' : charge.status;
      charge.updatedAt = new Date().toISOString();
      storage.set(STORAGE_KEYS.CHARGES, charges);
    }

    return payment;
  },

  // DELETE /api/payments/:id
  deletePayment: async (id: string) => {
    await delay(200);

    const payments = storage.get<Payment>(STORAGE_KEYS.PAYMENTS, mockPayments);
    const index = payments.findIndex((p) => p.id === id);

    if (index === -1) {
      throw createError('Payment not found', 404);
    }

    payments.splice(index, 1);
    storage.set(STORAGE_KEYS.PAYMENTS, payments);

    return { success: true };
  },
};

export default mockApi;

