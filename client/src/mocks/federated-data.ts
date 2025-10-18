/**
 * Federated Worker Identity - Mock Data
 * 
 * This file contains comprehensive test data for the federated worker model:
 * - Worker Profiles (global, portable)
 * - Employments (tenant-specific employment relationships)
 * - Employment Private Data (sensitive info)
 */

import type { WorkerProfile, Employment, EmploymentPrivateData } from "@shared/schema";

// ============================================
// WORKER PROFILES (Global - Worker owned)
// ============================================

export const mockWorkerProfiles: WorkerProfile[] = [
  {
    id: "wp-1",
    email: "ahmet.yilmaz@worker.com",
    password: "hashed_password", // In real app, this would be hashed
    firstName: "Ahmet",
    lastName: "Yılmaz",
    gender: "male",
    phone: "+31 6 1234 5678",
    nationality: "Türkiye",
    dateOfBirth: "1990-05-15",
    photo: "https://i.pravatar.cc/150?u=ahmet",
    bio: "Experienced warehouse worker with 5 years of experience",
    address: "Amsterdam, Netherlands",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "wp-2",
    email: "mehmet.demir@worker.com",
    password: "hashed_password",
    firstName: "Mehmet",
    lastName: "Demir",
    gender: "male",
    phone: "+31 6 2345 6789",
    nationality: "Türkiye",
    dateOfBirth: "1988-08-22",
    photo: "https://i.pravatar.cc/150?u=mehmet",
    bio: "Reliable cleaner, punctual and detail-oriented",
    address: "Rotterdam, Netherlands",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
  {
    id: "wp-3",
    email: "ayse.kaya@worker.com",
    password: "hashed_password",
    firstName: "Ayşe",
    lastName: "Kaya",
    gender: "female",
    phone: "+31 6 3456 7890",
    nationality: "Türkiye",
    dateOfBirth: "1995-03-10",
    photo: "https://i.pravatar.cc/150?u=ayse",
    bio: "Factory worker with excellent attendance record",
    address: "Utrecht, Netherlands",
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-03-05"),
  },
  {
    id: "wp-4",
    email: "fatma.sahin@worker.com",
    password: "hashed_password",
    firstName: "Fatma",
    lastName: "Şahin",
    gender: "female",
    phone: "+31 6 4567 8901",
    nationality: "Türkiye",
    dateOfBirth: "1992-11-20",
    photo: "https://i.pravatar.cc/150?u=fatma",
    bio: "Food processing specialist",
    address: "The Hague, Netherlands",
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01"),
  },
  {
    id: "wp-5",
    email: "ali.ozturk@worker.com",
    password: "hashed_password",
    firstName: "Ali",
    lastName: "Öztürk",
    gender: "male",
    phone: "+31 6 5678 9012",
    nationality: "Türkiye",
    dateOfBirth: "1987-07-14",
    photo: "https://i.pravatar.cc/150?u=ali",
    bio: "Logistics coordinator with forklift certification",
    address: "Eindhoven, Netherlands",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "wp-6",
    email: "emma.wilson@worker.com",
    password: "hashed_password",
    firstName: "Emma",
    lastName: "Wilson",
    gender: "female",
    phone: "+31 6 6789 0123",
    nationality: "United Kingdom",
    dateOfBirth: "1994-02-18",
    photo: "https://i.pravatar.cc/150?u=emma",
    bio: "Customer service specialist",
    address: "Den Haag, Netherlands",
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-05-10"),
  },
  {
    id: "wp-7",
    email: "tom.mueller@worker.com",
    password: "hashed_password",
    firstName: "Tom",
    lastName: "Müller",
    gender: "male",
    phone: "+49 151 2345 6789",
    nationality: "Germany",
    dateOfBirth: "1991-09-25",
    photo: "https://i.pravatar.cc/150?u=tom",
    bio: "Warehouse supervisor with 8 years experience",
    address: "Berlin, Germany",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "wp-8",
    email: "lisa.schmidt@worker.com",
    password: "hashed_password",
    firstName: "Lisa",
    lastName: "Schmidt",
    gender: "female",
    phone: "+49 162 3456 7890",
    nationality: "Germany",
    dateOfBirth: "1993-06-30",
    photo: "https://i.pravatar.cc/150?u=lisa",
    bio: "Quality control inspector",
    address: "Munich, Germany",
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-04-20"),
  },
  {
    id: "wp-9",
    email: "paul.anderson@worker.com",
    password: "hashed_password",
    firstName: "Paul",
    lastName: "Anderson",
    gender: "male",
    phone: "+44 7700 900123",
    nationality: "United Kingdom",
    dateOfBirth: "1989-11-12",
    photo: "https://i.pravatar.cc/150?u=paul",
    bio: "Maintenance technician",
    address: "London, United Kingdom",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2024-02-28"),
  },
  {
    id: "wp-10",
    email: "anna.kowalski@worker.com",
    password: "hashed_password",
    firstName: "Anna",
    lastName: "Kowalski",
    gender: "female",
    phone: "+48 600 123 456",
    nationality: "Poland",
    dateOfBirth: "1996-04-08",
    photo: "https://i.pravatar.cc/150?u=anna",
    bio: "Administrative assistant",
    address: "Warsaw, Poland",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "wp-11",
    email: "klaus.wagner@worker.com",
    password: "hashed_password",
    firstName: "Klaus",
    lastName: "Wagner",
    gender: "male",
    phone: "+49 171 9876 543",
    nationality: "Germany",
    dateOfBirth: "1985-12-03",
    photo: "https://i.pravatar.cc/150?u=klaus",
    bio: "Senior production manager",
    address: "Hamburg, Germany",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "wp-12",
    email: "mustafa.yildirim@worker.com",
    password: "hashed_password",
    firstName: "Mustafa",
    lastName: "Yıldırım",
    gender: "male",
    phone: "+31 6 7890 1234",
    nationality: "Türkiye",
    dateOfBirth: "1992-08-17",
    photo: "https://i.pravatar.cc/150?u=mustafa",
    bio: "Packaging specialist",
    address: "Eindhoven, Netherlands",
    createdAt: new Date("2024-07-05"),
    updatedAt: new Date("2024-07-05"),
  },
];

// ============================================
// EMPLOYMENTS (Tenant-specific)
// ============================================

export const mockEmployments: Employment[] = [
  // Ahmet - Active at Cova
  {
    id: "emp-1",
    workerProfileId: "wp-1",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-10-15",
    endDate: null,
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=ahmet",
    snapshotFirstName: "Ahmet",
    snapshotLastName: "Yılmaz",
    jobTitle: "Warehouse Worker",
    department: "Logistics",
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-15"),
    createdBy: "user-1",
  },
  
  // Mehmet - Active at Cova
  {
    id: "emp-2",
    workerProfileId: "wp-2",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-11-01",
    endDate: null,
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=mehmet",
    snapshotFirstName: "Mehmet",
    snapshotLastName: "Demir",
    jobTitle: "Cleaner",
    department: "Facility Management",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01"),
    createdBy: "user-1",
  },
  
  // Ayşe - Active at Cova
  {
    id: "emp-3",
    workerProfileId: "wp-3",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-09-01",
    endDate: null,
    snapshotGender: "female",
    snapshotPhoto: "https://i.pravatar.cc/150?u=ayse",
    snapshotFirstName: "Ayşe",
    snapshotLastName: "Kaya",
    jobTitle: "Factory Worker",
    department: "Production",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
    createdBy: "user-1",
  },
  
  // Fatma - Active at Cova
  {
    id: "emp-4",
    workerProfileId: "wp-4",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-11-10",
    endDate: null,
    snapshotGender: "female",
    snapshotPhoto: "https://i.pravatar.cc/150?u=fatma",
    snapshotFirstName: "Fatma",
    snapshotLastName: "Şahin",
    jobTitle: "Food Processor",
    department: "Production",
    createdAt: new Date("2024-11-10"),
    updatedAt: new Date("2024-11-10"),
    createdBy: "user-1",
  },
  
  // Ali - Former employee (left Cova)
  {
    id: "emp-5",
    workerProfileId: "wp-5",
    tenantId: "tenant-cova",
    status: "former",
    startDate: "2024-01-20",
    endDate: "2024-10-31", // Left on October 31st
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=ali",
    snapshotFirstName: "Ali",
    snapshotLastName: "Öztürk",
    jobTitle: "Logistics Coordinator",
    department: "Logistics",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-10-31"),
    createdBy: "user-1",
  },
  
  // Emma - Active at Cova
  {
    id: "emp-6",
    workerProfileId: "wp-6",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-05-10",
    endDate: null,
    snapshotGender: "female",
    snapshotPhoto: "https://i.pravatar.cc/150?u=emma",
    snapshotFirstName: "Emma",
    snapshotLastName: "Wilson",
    jobTitle: "Customer Service",
    department: "Administration",
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-05-10"),
    createdBy: "user-1",
  },
  
  // Tom - Active at Cova
  {
    id: "emp-7",
    workerProfileId: "wp-7",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-03-15",
    endDate: null,
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=tom",
    snapshotFirstName: "Tom",
    snapshotLastName: "Müller",
    jobTitle: "Warehouse Supervisor",
    department: "Logistics",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    createdBy: "user-1",
  },
  
  // Lisa - Active at Cova
  {
    id: "emp-8",
    workerProfileId: "wp-8",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-04-20",
    endDate: null,
    snapshotGender: "female",
    snapshotPhoto: "https://i.pravatar.cc/150?u=lisa",
    snapshotFirstName: "Lisa",
    snapshotLastName: "Schmidt",
    jobTitle: "Quality Inspector",
    department: "Production",
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-04-20"),
    createdBy: "user-1",
  },
  
  // Paul - Active at Cova
  {
    id: "emp-9",
    workerProfileId: "wp-9",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-02-28",
    endDate: null,
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=paul",
    snapshotFirstName: "Paul",
    snapshotLastName: "Anderson",
    jobTitle: "Maintenance Tech",
    department: "Facility Management",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2024-02-28"),
    createdBy: "user-1",
  },
  
  // Anna - Active at Cova
  {
    id: "emp-10",
    workerProfileId: "wp-10",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-06-01",
    endDate: null,
    snapshotGender: "female",
    snapshotPhoto: "https://i.pravatar.cc/150?u=anna",
    snapshotFirstName: "Anna",
    snapshotLastName: "Kowalski",
    jobTitle: "Admin Assistant",
    department: "Administration",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    createdBy: "user-1",
  },
  
  // Klaus - Active at Cova
  {
    id: "emp-11",
    workerProfileId: "wp-11",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-01-10",
    endDate: null,
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=klaus",
    snapshotFirstName: "Klaus",
    snapshotLastName: "Wagner",
    jobTitle: "Production Manager",
    department: "Production",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    createdBy: "user-1",
  },
  
  // Mustafa - Active at Cova
  {
    id: "emp-12",
    workerProfileId: "wp-12",
    tenantId: "tenant-cova",
    status: "active",
    startDate: "2024-07-05",
    endDate: null,
    snapshotGender: "male",
    snapshotPhoto: "https://i.pravatar.cc/150?u=mustafa",
    snapshotFirstName: "Mustafa",
    snapshotLastName: "Yıldırım",
    jobTitle: "Packaging Specialist",
    department: "Production",
    createdAt: new Date("2024-07-05"),
    updatedAt: new Date("2024-07-05"),
    createdBy: "user-1",
  },
];

// ============================================
// EMPLOYMENT PRIVATE DATA (Sensitive)
// ============================================

export const mockEmploymentPrivateData: EmploymentPrivateData[] = [
  // Ahmet's private data
  {
    id: "epd-1",
    employmentId: "emp-1",
    salary: "2500",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-10-15",
    contractEndDate: null,
    internalNotes: "Excellent worker, always on time. Recommended for team lead position.",
    performanceRating: "4.5",
    managerId: "user-1",
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-15"),
  },
  
  // Mehmet's private data
  {
    id: "epd-2",
    employmentId: "emp-2",
    salary: "2200",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-11-01",
    contractEndDate: null,
    internalNotes: "Reliable, good attention to detail",
    performanceRating: "4.2",
    managerId: "user-1",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01"),
  },
  
  // Ayşe's private data
  {
    id: "epd-3",
    employmentId: "emp-3",
    salary: "2400",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-09-01",
    contractEndDate: null,
    internalNotes: "Fast learner, excellent team player",
    performanceRating: "4.7",
    managerId: "user-1",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-01"),
  },
  
  // Fatma's private data
  {
    id: "epd-4",
    employmentId: "emp-4",
    salary: "2300",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "temporary",
    contractStartDate: "2024-11-10",
    contractEndDate: "2025-05-10", // 6-month contract
    internalNotes: "Seasonal worker, may extend contract",
    performanceRating: "4.0",
    managerId: "user-1",
    createdAt: new Date("2024-11-10"),
    updatedAt: new Date("2024-11-10"),
  },
  
  // Ali's private data (archived - he left)
  {
    id: "epd-5",
    employmentId: "emp-5",
    salary: "2600",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-01-20",
    contractEndDate: "2024-10-31",
    internalNotes: "Left for better opportunity. Would re-hire if needed.",
    performanceRating: "4.3",
    managerId: "user-1",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-10-31"),
  },
  
  // Emma's private data
  {
    id: "epd-6",
    employmentId: "emp-6",
    salary: "2100",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-05-10",
    contractEndDate: null,
    internalNotes: "Great communication skills",
    performanceRating: "4.1",
    managerId: "user-1",
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-05-10"),
  },
  
  // Tom's private data
  {
    id: "epd-7",
    employmentId: "emp-7",
    salary: "2800",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-03-15",
    contractEndDate: null,
    internalNotes: "Strong leadership skills",
    performanceRating: "4.6",
    managerId: "user-1",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  
  // Lisa's private data
  {
    id: "epd-8",
    employmentId: "emp-8",
    salary: "2350",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-04-20",
    contractEndDate: null,
    internalNotes: "Very detail-oriented",
    performanceRating: "4.4",
    managerId: "user-1",
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-04-20"),
  },
  
  // Paul's private data
  {
    id: "epd-9",
    employmentId: "emp-9",
    salary: "2450",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-02-28",
    contractEndDate: null,
    internalNotes: "Quick problem solver",
    performanceRating: "4.3",
    managerId: "user-1",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2024-02-28"),
  },
  
  // Anna's private data
  {
    id: "epd-10",
    employmentId: "emp-10",
    salary: "2150",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-06-01",
    contractEndDate: null,
    internalNotes: "Organized and efficient",
    performanceRating: "4.2",
    managerId: "user-1",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  
  // Klaus's private data
  {
    id: "epd-11",
    employmentId: "emp-11",
    salary: "3200",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-01-10",
    contractEndDate: null,
    internalNotes: "Senior manager, excellent track record",
    performanceRating: "4.8",
    managerId: "user-1",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  
  // Mustafa's private data
  {
    id: "epd-12",
    employmentId: "emp-12",
    salary: "2250",
    salaryFrequency: "monthly",
    currency: "EUR",
    contractType: "full_time",
    contractStartDate: "2024-07-05",
    contractEndDate: null,
    internalNotes: "Fast and accurate",
    performanceRating: "4.1",
    managerId: "user-1",
    createdAt: new Date("2024-07-05"),
    updatedAt: new Date("2024-07-05"),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get worker profile by employment ID
 */
export function getWorkerProfileByEmployment(employmentId: string): WorkerProfile | undefined {
  const employment = mockEmployments.find(emp => emp.id === employmentId);
  if (!employment) return undefined;
  return mockWorkerProfiles.find(profile => profile.id === employment.workerProfileId);
}

/**
 * Get all active employments for tenant
 */
export function getActiveEmployments(tenantId: string): Employment[] {
  return mockEmployments.filter(emp => emp.tenantId === tenantId && emp.status === "active");
}

/**
 * Get employment with full details (profile + private data)
 */
export function getEmploymentDetails(employmentId: string) {
  const employment = mockEmployments.find(emp => emp.id === employmentId);
  if (!employment) return null;
  
  const profile = mockWorkerProfiles.find(p => p.id === employment.workerProfileId);
  const privateData = mockEmploymentPrivateData.find(pd => pd.employmentId === employmentId);
  
  return {
    employment,
    profile,
    privateData
  };
}

/**
 * Get worker's employment history (for worker view)
 */
export function getWorkerEmploymentHistory(workerProfileId: string) {
  const employments = mockEmployments.filter(emp => emp.workerProfileId === workerProfileId);
  
  return employments.map(emp => ({
    companyName: "Cova B.V.", // In real app, get from tenant
    jobTitle: emp.jobTitle,
    startDate: emp.startDate,
    endDate: emp.endDate,
    status: emp.status,
    duration: calculateDuration(emp.startDate, emp.endDate)
  }));
}

function calculateDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (months < 1) return "Less than 1 month";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}
