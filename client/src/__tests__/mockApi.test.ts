/**
 * Mock API Test Cases
 * Tüm CRUD operasyonları, pagination, filtering ve form validation testleri
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import mockApi from '@/services/mockApi';
import { initializeMockData } from '@/services/mockApi';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Mock API Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeMockData();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const result = await mockApi.login({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      await expect(
        mockApi.login({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });

    it('should logout successfully', async () => {
      const result = await mockApi.logout();
      expect(result.success).toBe(true);
    });
  });

  describe('Workers CRUD', () => {
    it('should get all workers', async () => {
      const workers = await mockApi.getWorkers('tenant-001');
      expect(Array.isArray(workers)).toBe(true);
      expect(workers.length).toBeGreaterThan(0);
    });

    it('should create a new worker', async () => {
      const newWorker = await mockApi.createWorker({
        email: 'newworker@example.com',
        firstName: 'Yeni',
        lastName: 'İşçi',
        gender: 'male',
        tenantId: 'tenant-001',
        jobTitle: 'Developer',
      });

      expect(newWorker).toHaveProperty('id');
      expect(newWorker.email).toBe('newworker@example.com');
    });

    it('should get worker by employmentId', async () => {
      const workers = await mockApi.getWorkers('tenant-001');
      if (workers.length > 0) {
        const worker = await mockApi.getWorker(workers[0].id);
        expect(worker).toHaveProperty('id');
        expect(worker.id).toBe(workers[0].id);
      }
    });

    it('should update employment', async () => {
      const workers = await mockApi.getWorkers('tenant-001');
      if (workers.length > 0) {
        const updated = await mockApi.updateEmployment(workers[0].id, {
          jobTitle: 'Senior Developer',
        });
        expect(updated.jobTitle).toBe('Senior Developer');
      }
    });
  });

  describe('Houses CRUD', () => {
    it('should get all houses', async () => {
      const houses = await mockApi.getHouses('tenant-001');
      expect(Array.isArray(houses)).toBe(true);
    });

    it('should create a new house', async () => {
      const newHouse = await mockApi.createHouse({
        tenantId: 'tenant-001',
        address: 'Test Caddesi 123',
        city: 'İstanbul',
        rooms: [
          {
            roomNumber: '101',
            beds: 2,
            canRentAsRoom: false,
          },
        ],
      });

      expect(newHouse).toHaveProperty('id');
      expect(newHouse.address).toBe('Test Caddesi 123');
    });

    it('should update house', async () => {
      const houses = await mockApi.getHouses('tenant-001');
      if (houses.length > 0) {
        const updated = await mockApi.updateHouse(houses[0].id, {
          name: 'Updated House Name',
        });
        expect(updated.name).toBe('Updated House Name');
      }
    });

    it('should delete house', async () => {
      const houses = await mockApi.getHouses('tenant-001');
      if (houses.length > 0) {
        const result = await mockApi.deleteHouse(houses[0].id);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Reservations', () => {
    it('should check-in to bed', async () => {
      const houses = await mockApi.getHouses('tenant-001');
      if (houses.length > 0 && houses[0].rooms?.[0]?.beds?.[0]) {
        const bedId = houses[0].rooms[0].beds[0].id;
        const workers = await mockApi.getWorkers('tenant-001');
        
        if (workers.length > 0) {
          const result = await mockApi.checkInBed(bedId, {
            employmentId: workers[0].id,
            startDate: '2025-01-27',
            tenantId: 'tenant-001',
            monthlyRate: 600,
          });

          expect(result).toHaveProperty('reservation');
          expect(result).toHaveProperty('assignment');
        }
      }
    });

    it('should get reservations', async () => {
      const reservations = await mockApi.getReservations('tenant-001');
      expect(Array.isArray(reservations)).toBe(true);
    });

    it('should check-out reservation', async () => {
      const reservations = await mockApi.getReservations('tenant-001');
      if (reservations.length > 0) {
        const result = await mockApi.checkOutReservation(reservations[0].id, {
          checkOutDate: '2025-01-28',
        });
        expect(result.status).toBe('checked_out');
      }
    });
  });

  describe('QR Codes', () => {
    it('should get all QR codes', async () => {
      const qrCodes = await mockApi.getQRCodes('tenant-001');
      expect(Array.isArray(qrCodes)).toBe(true);
    });

    it('should create QR code', async () => {
      const newQR = await mockApi.createQRCode({
        tenantId: 'tenant-001',
        type: 'worker_registration',
        code: 'TEST123',
        title: 'Test QR Code',
      });

      expect(newQR).toHaveProperty('id');
      expect(newQR.code).toBe('TEST123');
    });

    it('should update QR code', async () => {
      const qrCodes = await mockApi.getQRCodes('tenant-001');
      if (qrCodes.length > 0) {
        const updated = await mockApi.updateQRCode(qrCodes[0].id, {
          status: 'disabled',
        });
        expect(updated.status).toBe('disabled');
      }
    });

    it('should delete QR code', async () => {
      const qrCodes = await mockApi.getQRCodes('tenant-001');
      if (qrCodes.length > 0) {
        const result = await mockApi.deleteQRCode(qrCodes[0].id);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Assignments', () => {
    it('should get all assignments', async () => {
      const assignments = await mockApi.getAssignments('tenant-001');
      expect(Array.isArray(assignments)).toBe(true);
    });

    it('should create assignment', async () => {
      const houses = await mockApi.getHouses('tenant-001');
      const workers = await mockApi.getWorkers('tenant-001');
      
      if (houses.length > 0 && workers.length > 0 && houses[0].rooms?.[0]?.beds?.[0]) {
        const assignment = await mockApi.createAssignment('tenant-001', {
          employmentId: workers[0].id,
          houseId: houses[0].id,
          roomId: houses[0].rooms[0].id,
          bedId: houses[0].rooms[0].beds[0].id,
          startDate: '2025-01-27',
          monthlyRate: '600',
        });

        expect(assignment).toHaveProperty('id');
      }
    });

    it('should update assignment', async () => {
      const assignments = await mockApi.getAssignments('tenant-001');
      if (assignments.length > 0) {
        const updated = await mockApi.updateAssignment(assignments[0].id, {
          status: 'inactive',
        });
        expect(updated.status).toBe('inactive');
      }
    });
  });

  describe('Charges', () => {
    it('should get all charges', async () => {
      const charges = await mockApi.getCharges('tenant-001');
      expect(Array.isArray(charges)).toBe(true);
    });

    it('should create charge', async () => {
      const assignments = await mockApi.getAssignments('tenant-001');
      if (assignments.length > 0) {
        const charge = await mockApi.createCharge('tenant-001', {
          assignmentId: assignments[0].id,
          month: '2025-01',
          amount: '600',
          expectedAmount: '600',
          remainingAmount: '600',
          days: 30,
          calculationType: 'monthly',
          dueDate: '2025-01-31',
        });

        expect(charge).toHaveProperty('id');
      }
    });

    it('should update charge', async () => {
      const charges = await mockApi.getCharges('tenant-001');
      if (charges.length > 0) {
        const updated = await mockApi.updateCharge(charges[0].id, {
          status: 'paid',
        });
        expect(updated.status).toBe('paid');
      }
    });
  });

  describe('Payments', () => {
    it('should get all payments', async () => {
      const payments = await mockApi.getPayments('tenant-001');
      expect(Array.isArray(payments)).toBe(true);
    });

    it('should create payment', async () => {
      const charges = await mockApi.getCharges('tenant-001');
      if (charges.length > 0) {
        const payment = await mockApi.createPayment('tenant-001', {
          chargeId: charges[0].id,
          amount: '600',
          paymentDate: '2025-01-27',
          paymentMethod: 'cash',
        });

        expect(payment).toHaveProperty('id');
      }
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter workers by tenant', async () => {
      const workers1 = await mockApi.getWorkers('tenant-001');
      const workers2 = await mockApi.getWorkers('tenant-002');
      
      expect(workers1.length).toBeGreaterThan(0);
      expect(workers2.length).toBeGreaterThan(0);
      
      // Farklı tenant'lar farklı worker'lar döndürmeli
      if (workers1.length > 0 && workers2.length > 0) {
        expect(workers1[0].tenantId).toBe('tenant-001');
        expect(workers2[0].tenantId).toBe('tenant-002');
      }
    });

    it('should filter reservations by bed', async () => {
      const houses = await mockApi.getHouses('tenant-001');
      if (houses.length > 0 && houses[0].rooms?.[0]?.beds?.[0]) {
        const bedId = houses[0].rooms[0].beds[0].id;
        const reservations = await mockApi.getReservations('tenant-001', bedId);
        
        reservations.forEach((r) => {
          expect(r.bedId).toBe(bedId);
        });
      }
    });

    it('should filter active reservations', async () => {
      const activeReservations = await mockApi.getReservations('tenant-001', undefined, 'true');
      activeReservations.forEach((r) => {
        expect(r.status).toBe('checked_in');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      await expect(mockApi.getWorker('non-existent-id')).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      await expect(
        mockApi.createWorker({
          email: '', // Invalid email
          firstName: '',
          lastName: '',
          gender: 'male',
          tenantId: 'tenant-001',
        })
      ).rejects.toThrow();
    });
  });

  describe('Data Persistence', () => {
    it('should persist data in localStorage', async () => {
      const newWorker = await mockApi.createWorker({
        email: 'persist-test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        tenantId: 'tenant-001',
      });

      // Clear and reinitialize
      localStorage.clear();
      initializeMockData();

      // Data should still be there (from localStorage)
      const workers = await mockApi.getWorkers('tenant-001');
      const found = workers.find((w) => w.email === 'persist-test@example.com');
      expect(found).toBeDefined();
    });
  });
});

