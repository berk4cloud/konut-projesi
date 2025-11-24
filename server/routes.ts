import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from "express";
import { storage } from "./storage";
import { 
  insertWorkerProfileSchema, 
  insertEmploymentSchema,
  insertEmploymentPrivateDataSchema,
  type User,
  type Tenant,
  type InsertReservation
} from "@shared/schema";
import { z } from "zod";
import { requireTenant, requireTenantContext } from "./middleware/tenant";
import { authenticateTenantUser } from "./middleware/auth";
import { verifyPassword, generateTenantUserToken, generatePlatformAdminToken } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();

  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  // POST /tenant/login - Tenant user login
  apiRouter.post("/tenant/login", requireTenant, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email ve şifre gerekli" });
      }
      
      const tenant = req.tenant!; // requireTenant ensures this exists
      
      // Find user by tenant + email
      const user = await storage.getUserByTenantEmail(tenant.id, email);
      
      if (!user) {
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }
      
      // Check if user is active
      if (user.status !== "active") {
        return res.status(403).json({ 
          error: "Hesap aktif değil",
          message: user.status === "invited" 
            ? "Lütfen önce email davetinizi onaylayın" 
            : "Hesabınız devre dışı"
        });
      }
      
      // Verify password
      if (!user.password) {
        return res.status(403).json({ 
          error: "Şifre ayarlanmamış",
          message: "Lütfen önce şifrenizi ayarlayın"
        });
      }
      
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }
      
      // For simple demo login, use first role
      const selectedRole = user.roles[0];
      
      // Generate JWT token
      const token = generateTenantUserToken(user, tenant, selectedRole);
      
      // Return user info + token
      res.json({
        token,
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          selectedRole, // Currently selected role
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
          favoriteCountries: (tenant as any).favorite_countries || tenant.favoriteCountries || [],
          defaultCountry: (tenant as any).default_country || tenant.defaultCountry || null,
        }
      });
    } catch (error) {
      console.error("Tenant login error:", error);
      res.status(500).json({ error: "Giriş yapılırken hata oluştu" });
    }
  });

  // POST /login - Smart login endpoint with multi-tenant/multi-role support
  apiRouter.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email ve şifre gerekli" });
      }
      
      // Normalize email to lowercase for case-insensitive lookup
      const normalizedEmail = email.toLowerCase().trim();
      
      // 1. Check if platform admin
      const admin = await storage.getPlatformAdminByEmail(normalizedEmail);
      if (admin && admin.password) {
        const isValid = await verifyPassword(password, admin.password);
        if (isValid) {
          const token = generatePlatformAdminToken(admin);
          return res.json({
            type: "platform_admin",
            token,
            admin: {
              id: admin.id,
              email: admin.email,
              firstName: admin.firstName,
              lastName: admin.lastName,
              role: admin.role,
            }
          });
        }
      }
      
      // 2. Get all tenant-user records for this email
      const userRecords = await storage.getUsersByEmail(normalizedEmail);
      
      if (userRecords.length === 0) {
        console.log(`[LOGIN] User not found: ${normalizedEmail}`);
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }
      
      // 3. Verify password using first record (password is same across all tenants)
      const firstUser = userRecords[0];
      if (!firstUser.password) {
        console.log(`[LOGIN] User found but no password set: ${normalizedEmail}`);
        return res.status(403).json({ 
          error: "Şifre ayarlanmamış",
          message: "Lütfen önce şifrenizi ayarlayın"
        });
      }
      
      const isValid = await verifyPassword(password, firstUser.password);
      if (!isValid) {
        console.log(`[LOGIN] Invalid password for: ${normalizedEmail}`);
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }
      
      // 4. Build tenant-role contexts
      const contexts = await Promise.all(
        userRecords.map(async (user: User) => {
          const tenant = await storage.getTenant(user.tenantId);
          return {
            user,
            tenant,
            roles: user.roles,
          };
        })
      );
      
      // Filter out inactive users or missing tenants
      const activeContexts = contexts.filter(
        (ctx: { user: User; tenant: Tenant | undefined; roles: string[] }) => 
          ctx.user.status === "active" && ctx.tenant
      );
      
      if (activeContexts.length === 0) {
        return res.status(403).json({ 
          error: "Hesap aktif değil",
          message: "Tüm hesaplarınız devre dışı"
        });
      }
      
      // 5. Decision tree for smart routing
      
      // Case: Single tenant
      if (activeContexts.length === 1) {
        const ctx = activeContexts[0];
        
        // Case: Single tenant + Single role → Direct redirect
        if (ctx.roles.length === 1) {
          const token = generateTenantUserToken(ctx.user, ctx.tenant!, ctx.roles[0]);
          return res.json({
            type: "redirect",
            token,
            user: {
              id: ctx.user.id,
              email: ctx.user.email,
              firstName: ctx.user.firstName,
              lastName: ctx.user.lastName,
            },
            tenant: {
              id: ctx.tenant!.id,
              name: ctx.tenant!.name,
              slug: ctx.tenant!.slug,
              favoriteCountries: (ctx.tenant as any).favorite_countries || ctx.tenant.favoriteCountries || [],
              defaultCountry: (ctx.tenant as any).default_country || ctx.tenant.defaultCountry || null,
            },
            role: ctx.roles[0],
          });
        }
        
        // Case: Single tenant + Multi role → Show role selector
        return res.json({
          type: "select_role",
          tenant: {
            id: ctx.tenant!.id,
            name: ctx.tenant!.name,
            slug: ctx.tenant!.slug,
            favoriteCountries: (ctx.tenant as any).favorite_countries || ctx.tenant.favoriteCountries || [],
            defaultCountry: (ctx.tenant as any).default_country || ctx.tenant.defaultCountry || null,
          },
          roles: ctx.roles,
          user: {
            id: ctx.user.id,
            email: ctx.user.email,
            firstName: ctx.user.firstName,
            lastName: ctx.user.lastName,
          },
        });
      }
      
      // Case: Multi tenant → Show tenant selector
      return res.json({
        type: "select_tenant",
        tenants: activeContexts.map((ctx: { user: User; tenant: Tenant | undefined; roles: string[] }) => ({
          tenant: {
            id: ctx.tenant!.id,
            name: ctx.tenant!.name,
            slug: ctx.tenant!.slug,
            type: ctx.tenant!.type,
          },
          roles: ctx.roles,
        })),
        user: {
          email: firstUser.email,
          firstName: firstUser.firstName,
          lastName: firstUser.lastName,
        },
      });
      
    } catch (error) {
      console.error("Smart login error:", error);
      res.status(500).json({ error: "Giriş yapılırken hata oluştu" });
    }
  });

  // POST /platform/login - Platform admin login
  apiRouter.post("/platform/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      // Find platform admin by email
      const admin = await storage.getPlatformAdminByEmail(email);
      
      if (!admin) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Verify password
      const isValid = await verifyPassword(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = generatePlatformAdminToken(admin);
      
      // Return admin info + token
      res.json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        }
      });
    } catch (error) {
      console.error("Platform login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /login/confirm - Confirm tenant/role selection and get token
  apiRouter.post("/login/confirm", async (req, res) => {
    try {
      const { email, tenantId, role } = req.body;
      
      if (!email || !tenantId || !role) {
        return res.status(400).json({ error: "Email, tenantId ve rol gerekli" });
      }
      
      // Find user by tenant + email
      const user = await storage.getUserByTenantEmail(tenantId, email);
      
      if (!user || user.status !== "active") {
        return res.status(401).json({ error: "Kullanıcı bulunamadı veya aktif değil" });
      }
      
      // Verify user has this role
      if (!user.roles.includes(role)) {
        return res.status(403).json({ error: "Bu role sahip değilsiniz" });
      }
      
      // Get tenant
      const tenant = await storage.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant bulunamadı" });
      }
      
      // Generate token
      const token = generateTenantUserToken(user, tenant, role);
      
      res.json({
        token,
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
          favoriteCountries: (tenant as any).favorite_countries || tenant.favoriteCountries || [],
          defaultCountry: (tenant as any).default_country || tenant.defaultCountry || null,
        },
        role,
      });
    } catch (error) {
      console.error("Login confirm error:", error);
      res.status(500).json({ error: "Token oluşturma hatası" });
    }
  });

  // POST /logout - Logout (JWT-based, client-side token removal)
  apiRouter.post("/logout", async (req, res) => {
    // Since we're using JWT tokens, logout is handled client-side by removing the token
    // This endpoint exists for future session management or audit logging
    res.json({ success: true, message: "Çıkış yapıldı" });
  });

  // ============================================
  // JWT AUTHENTICATION MIDDLEWARE
  // ============================================
  // All routes after this point require a valid JWT token
  // The middleware attaches req.user with { id, email, tenantId, role, type }
  apiRouter.use(authenticateTenantUser);
  apiRouter.use(requireTenantContext);

  // ============================================
  // FEDERATED WORKER IDENTITY ENDPOINTS
  // ============================================

  // POST /workers - Create new worker (profile + employment + private data)
  // This creates a federated worker with all associated records
  apiRouter.post("/workers", async (req, res) => {
    try {
      if (!req.tenant) {
        return res.status(403).json({ error: "Forbidden: No tenant context" });
      }
      const tenantId = req.tenant.id;

      // Validate input
      const createWorkerSchema = z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        gender: z.enum(["male", "female"]),
        phone: z.string().optional(),
        nationality: z.string().optional(),
        dateOfBirth: z.string().optional(),
        jobTitle: z.string().optional(),
        department: z.string().optional(),
        startDate: z.string().optional(),
        salary: z.string().optional(),
        salaryFrequency: z.string().optional(),
        contractType: z.string().optional(),
      });

      const data = createWorkerSchema.parse(req.body);

      // Check if worker profile already exists
      let workerProfile = await storage.getWorkerProfileByEmail(data.email);
      
      if (!workerProfile) {
        // Create new worker profile
        workerProfile = await storage.createWorkerProfile({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          phone: data.phone || null,
          nationality: data.nationality || null,
          dateOfBirth: data.dateOfBirth || null,
          password: null, // No worker authentication yet
          photo: null,
          bio: null,
          address: null,
        });
      }

      // Create employment relationship
      const employment = await storage.createEmployment({
        workerProfileId: workerProfile.id,
        tenantId,
        status: "active",
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: null,
        snapshotGender: workerProfile.gender,
        snapshotPhoto: workerProfile.photo || null,
        snapshotFirstName: workerProfile.firstName,
        snapshotLastName: workerProfile.lastName,
        jobTitle: data.jobTitle || null,
        department: data.department || null,
        createdBy: null, // TODO: Get from session
      });

      // Create employment private data if salary provided
      if (data.salary || data.contractType) {
        await storage.createEmploymentPrivateData({
          employmentId: employment.id,
          salary: data.salary || null,
          salaryFrequency: data.salaryFrequency || null,
          currency: "EUR",
          contractType: data.contractType || null,
          contractStartDate: data.startDate || null,
          contractEndDate: null,
          internalNotes: null,
          performanceRating: null,
          managerId: null,
        });
      }

      // Return combined data in legacy format for compatibility
      const result = {
        id: employment.id, // employmentId is the "worker id" for UI
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

      res.json(result);
    } catch (error) {
      console.error("Error creating worker:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create worker" });
    }
  });

  // GET /workers - Get all active workers for tenant
  apiRouter.get("/workers", async (req, res) => {
    try {
      if (!req.tenant) {
        return res.status(403).json({ error: "Forbidden: No tenant context" });
      }
      const tenantId = req.tenant.id;

      // Get all employments for tenant
      const employments = await storage.getActiveEmploymentsByTenant(tenantId);

      // Fetch worker profiles for all employments
      const workersWithProfiles = await Promise.all(
        employments.map(async (employment) => {
          const profile = await storage.getWorkerProfile(employment.workerProfileId);
          
          if (!profile) {
            console.warn(`Worker profile ${employment.workerProfileId} not found for employment ${employment.id}`);
            return null;
          }

          // Get housing info (room-first architecture)
          const housingInfo = await storage.getWorkerHousingInfo(employment.id);

          // Return in legacy format for compatibility + housing info
          return {
            id: employment.id, // employmentId is the "worker id"
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
            housing: housingInfo,
          };
        })
      );

      // Filter out nulls
      const workers = workersWithProfiles.filter((w) => w !== null);

      res.json(workers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  // GET /workers-with-accommodation - Get all workers with their current accommodation details
  apiRouter.get("/workers-with-accommodation", async (req, res) => {
    try {
      if (!req.tenant) {
        return res.status(403).json({ error: "Forbidden: No tenant context" });
      }
      const tenantId = req.tenant.id;

      // Get all employments for tenant
      const employments = await storage.getActiveEmploymentsByTenant(tenantId);
      
      // Get all active reservations for tenant
      const activeReservations = await storage.getActiveReservationsByTenant(tenantId);

      // Fetch worker profiles and accommodation for all employments
      const workersWithAccommodation = await Promise.all(
        employments.map(async (employment) => {
          const profile = await storage.getWorkerProfile(employment.workerProfileId);
          
          if (!profile) {
            return null;
          }

          // Find active reservation for this worker
          const reservation = activeReservations.find(r => r.employmentId === employment.id);

          if (!reservation) {
            // Worker has no active accommodation
            return null;
          }

          // Get bed, room, and house details
          const bed = await storage.getBed(reservation.bedId);
          if (!bed) return null;

          const room = await storage.getRoom(bed.roomId);
          if (!room) return null;

          const house = await storage.getHouse(room.houseId);
          if (!house) return null;

          // Return worker with accommodation details
          return {
            employmentId: employment.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            gender: profile.gender,
            email: profile.email,
            currentBedId: bed.id,
            roomNumber: room.roomNumber,
            bedNumber: bed.bedNumber,
            houseName: house.name,
            checkInDate: reservation.checkInDate,
            status: employment.status,
          };
        })
      );

      // Filter out nulls (workers without accommodation)
      const workers = workersWithAccommodation.filter((w) => w !== null);

      res.json(workers);
    } catch (error) {
      console.error("Error fetching workers with accommodation:", error);
      res.status(500).json({ error: "Failed to fetch workers with accommodation" });
    }
  });

  // GET /workers/:employmentId - Get specific worker by employmentId
  apiRouter.get("/workers/:employmentId", async (req, res) => {
    try {
      const { employmentId } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }

      const employment = await storage.getEmployment(employmentId);
      if (!employment || employment.tenantId !== tenantId) {
        return res.status(404).json({ error: "Worker not found" });
      }

      const profile = await storage.getWorkerProfile(employment.workerProfileId);
      if (!profile) {
        return res.status(404).json({ error: "Worker profile not found" });
      }

      // Return in legacy format
      const worker = {
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

      res.json(worker);
    } catch (error) {
      console.error("Error fetching worker:", error);
      res.status(500).json({ error: "Failed to fetch worker" });
    }
  });

  // PATCH /employments/:id - Update employment
  apiRouter.patch("/employments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      
      const updateSchema = z.object({
        status: z.enum(["active", "inactive", "former", "invited"]).optional(),
        endDate: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        department: z.string().nullable().optional(),
      });

      const updates = updateSchema.parse(req.body);

      const existing = await storage.getEmployment(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "Employment not found" });
      }

      const employment = await storage.updateEmployment(id, updates);
      
      if (!employment) {
        return res.status(404).json({ error: "Employment not found" });
      }

      res.json(employment);
    } catch (error) {
      console.error("Error updating employment:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update employment" });
    }
  });

  // GET /worker-profiles/:email - Check if worker profile exists
  apiRouter.get("/worker-profiles/:email", async (req, res) => {
    try {
      const { email } = req.params;
      
      const profile = await storage.getWorkerProfileByEmail(email);
      
      if (!profile) {
        return res.status(404).json({ error: "Worker profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching worker profile:", error);
      res.status(500).json({ error: "Failed to fetch worker profile" });
    }
  });

  // GET /employments/worker/:workerProfileId - Get all employments for a worker
  apiRouter.get("/employments/worker/:workerProfileId", async (req, res) => {
    try {
      const { workerProfileId } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      
      const employments = await storage.getEmploymentsByWorkerProfile(workerProfileId);
      
      res.json(employments.filter((employment) => employment.tenantId === tenantId));
    } catch (error) {
      console.error("Error fetching employments:", error);
      res.status(500).json({ error: "Failed to fetch employments" });
    }
  });

  // ============================================
  // COUNTRIES ENDPOINTS
  // ============================================

  // GET /countries - Get all active countries
  apiRouter.get("/countries", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  // ============================================
  // TENANT SETTINGS ENDPOINTS
  // ============================================

  // GET /tenants/:id - Get tenant details
  apiRouter.get("/tenants/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.tenant || req.tenant.id !== id) {
        return res.status(403).json({ error: "Bu tenant'a erişim izniniz yok" });
      }

      const tenant = await storage.getTenant(id);
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Map snake_case to camelCase for frontend compatibility
      const response = {
        ...tenant,
        favoriteCountries: (tenant as any).favorite_countries || tenant.favoriteCountries || [],
        defaultCountry: (tenant as any).default_country || tenant.defaultCountry || null,
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  // PATCH /tenants/:id - Update tenant settings (country management)
  apiRouter.patch("/tenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!req.tenant || req.tenant.id !== id) {
        return res.status(403).json({ error: "Bu tenant'ı güncelleme izniniz yok" });
      }

      console.log("PATCH /tenants/:id - Request body:", updates);
      
      // Normalize and validate timezone if provided (IANA validation)
      if (updates.timezone !== undefined && updates.timezone !== null) {
        const { DateTime } = await import('luxon');
        if (typeof updates.timezone !== 'string') {
          return res.status(400).json({ 
            error: "Timezone must be a string" 
          });
        }
        // Normalize: trim whitespace, convert empty string to undefined (use default)
        const trimmedTimezone = updates.timezone.trim();
        if (trimmedTimezone.length === 0) {
          updates.timezone = undefined; // Use default "UTC"
        } else {
          // Validate IANA timezone
          if (!DateTime.now().setZone(trimmedTimezone).isValid) {
            return res.status(400).json({ 
              error: "Invalid IANA timezone string. Use format like 'Europe/Amsterdam' or 'America/New_York'" 
            });
          }
          updates.timezone = trimmedTimezone; // Store trimmed value
        }
      }
      
      const tenant = await storage.updateTenant(id, updates);
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      console.log("PATCH /tenants/:id - Response tenant:", JSON.stringify(tenant, null, 2));

      // Map snake_case to camelCase for frontend compatibility
      const response = {
        ...tenant,
        favoriteCountries: (tenant as any).favorite_countries || tenant.favoriteCountries || [],
        defaultCountry: (tenant as any).default_country || tenant.defaultCountry || null,
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating tenant:", error);
      res.status(500).json({ error: "Failed to update tenant" });
    }
  });

  // ============================================
  // HOUSES ENDPOINTS
  // ============================================

  // GET /houses - Get all houses for a tenant (with rooms, beds, and active reservations)
  apiRouter.get("/houses", async (req, res) => {
    try {
      if (!req.tenant) {
        return res.status(403).json({ error: "Forbidden: No tenant context" });
      }
      const tenantId = req.tenant.id;
      const selectedDate = req.query.date as string || new Date().toISOString().split('T')[0];

      const houses = await storage.getHousesByTenant(tenantId);
      
      // Fetch rooms, beds, and reservations for each house
      const housesWithDetails = await Promise.all(
        houses.map(async (house) => {
          const rooms = await storage.getRoomsByHouse(house.id);
          
          // For each room, fetch beds with their active reservations
          const roomsWithBeds = await Promise.all(
            rooms.map(async (room) => {
              // Get room reservation info (if exists)
              const roomReservationDetailsRaw = await storage.getActiveRoomReservationWithOccupants(room.id);
              
              // Filter room reservation based on selected date (similar to bed reservations)
              let roomReservationDetails = null;
              if (roomReservationDetailsRaw && roomReservationDetailsRaw.roomReservation) {
                const roomRes = roomReservationDetailsRaw.roomReservation;
                const checkInDateStr = roomRes.checkInDate 
                  ? new Date(roomRes.checkInDate).toISOString().split('T')[0]
                  : null;
                const checkOutDateStr = roomRes.checkOutDate 
                  ? new Date(roomRes.checkOutDate).toISOString().split('T')[0]
                  : null;
                
                // Show room reservation only if it's active on the selected date
                // Active = checked in on/before selected date AND (no checkout OR checkout after selected date)
                if (checkInDateStr && checkInDateStr <= selectedDate && (!checkOutDateStr || checkOutDateStr > selectedDate)) {
                  roomReservationDetails = roomReservationDetailsRaw;
                }
              }
              
              const beds = await storage.getBedsByRoom(room.id);
              
              // For each bed, fetch all reservations and filter by selected date
              const bedsWithWorkers = await Promise.all(
                beds.map(async (bed) => {
                  // Get all reservations for this bed (not just active ones)
                  const allReservations = await storage.getReservationsByBed(bed.id);
                  
                  // Debug: Log reservations for this bed
                  if (allReservations.length > 0) {
                    console.log(`[HOUSES API] Bed ${bed.bedNumber} (${bed.id}) has ${allReservations.length} reservation(s)`, {
                      bedId: bed.id,
                      bedNumber: bed.bedNumber,
                      selectedDate,
                      reservations: allReservations.map(r => ({
                        id: r.id,
                        checkInDate: r.checkInDate,
                        checkOutDate: r.checkOutDate,
                        startDate: r.startDate,
                        endDate: r.endDate
                      }))
                    });
                  }
                  
                  // Find reservation that is active on the selected date
                  let reservation = null;
                  for (const res of allReservations) {
                    if (res.checkInDate) {
                      // Handle both Date objects and string dates
                      const checkInDate = res.checkInDate instanceof Date 
                        ? res.checkInDate 
                        : new Date(res.checkInDate);
                      const checkInDateStr = checkInDate.toISOString().split('T')[0];
                      
                      const checkOutDateStr = res.checkOutDate 
                        ? (res.checkOutDate instanceof Date 
                            ? res.checkOutDate 
                            : new Date(res.checkOutDate)).toISOString().split('T')[0]
                        : null;
                      
                      // Debug: Log date comparison
                      console.log(`[HOUSES API] Checking reservation ${res.id} for bed ${bed.bedNumber}:`, {
                        checkInDateStr,
                        checkOutDateStr,
                        selectedDate,
                        checkInDateStrLessOrEqual: checkInDateStr <= selectedDate,
                        checkOutDateStrGreater: !checkOutDateStr || checkOutDateStr > selectedDate,
                        isActive: checkInDateStr <= selectedDate && (!checkOutDateStr || checkOutDateStr > selectedDate)
                      });
                      
                      // Check if this reservation is active on the selected date
                      // Active = checked in on/before selected date AND (no checkout OR checkout after selected date)
                      if (checkInDateStr <= selectedDate && (!checkOutDateStr || checkOutDateStr > selectedDate)) {
                        reservation = res;
                        console.log(`[HOUSES API] Found active reservation ${res.id} for bed ${bed.bedNumber} on ${selectedDate}`);
                        break; // Use the first matching reservation
                      }
                    }
                  }
                  
                  // If bed has active reservation, fetch employment/worker details
                  let worker = undefined;
                  if (reservation) {
                    const employment = await storage.getEmployment(reservation.employmentId);
                    if (employment) {
                      const workerProfile = await storage.getWorkerProfile(employment.workerProfileId);
                      if (workerProfile) {
                        worker = {
                          employmentId: employment.id,
                          name: `${workerProfile.firstName} ${workerProfile.lastName}`,
                          gender: workerProfile.gender,
                        };
                      }
                    }
                  }
                  
                  // Calculate bed status based on reservation and selected date
                  // If room has active room reservation, all beds in that room are occupied
                  let status = bed.status || "available";
                  let hasFutureReservation = false;
                  
                  // Check if room reservation makes this bed occupied
                  if (roomReservationDetails && roomReservationDetails.roomReservation) {
                    status = "occupied";
                    // Set worker info from room reservation lead tenant if available
                    if (roomReservationDetails.leadTenant) {
                      worker = {
                        employmentId: roomReservationDetails.leadTenant.employmentId,
                        name: roomReservationDetails.leadTenant.name,
                        gender: undefined, // Room reservations don't have gender info at bed level
                      };
                    }
                  }
                  // Otherwise, check individual bed reservation
                  // Note: reservation is already filtered to be active on selectedDate
                  else if (reservation) {
                    status = "occupied";
                  }
                  
                  // Check for future reservations (for hasFutureReservation flag)
                  // Only check if no active reservation found for selected date
                  if (!reservation && !roomReservationDetails && allReservations.length > 0) {
                    const futureReservation = allReservations.find(res => {
                      if (res.checkInDate) {
                        const checkInDateStr = new Date(res.checkInDate).toISOString().split('T')[0];
                        return checkInDateStr > selectedDate;
                      }
                      return false;
                    });
                    if (futureReservation) {
                      hasFutureReservation = true;
                    }
                  }
                  
                  const bedData = {
                    id: bed.id,
                    bedNumber: bed.bedNumber,
                    status,
                    worker: hasFutureReservation ? worker : (status === "occupied" ? worker : undefined),
                    hasFutureReservation,
                    checkInDate: reservation?.checkInDate || undefined,
                    checkOutDate: reservation?.checkOutDate || undefined,
                    expectedMoveOutDate: reservation?.checkOutDate || reservation?.endDate || undefined,
                    expectedMoveInDate: reservation?.checkInDate || reservation?.startDate || undefined,
                    reservationId: reservation?.id || undefined,
                    roomNumber: room.roomNumber,
                    houseName: house.name,
                  };
                  
                  // Debug log for Ahmet Yılmaz
                  if (worker?.name?.includes('Ahmet')) {
                    console.log('[BED DATA] Ahmet found:', {
                      bed: bedData.id,
                      status: bedData.status,
                      checkInDate: bedData.checkInDate,
                      checkOutDate: bedData.checkOutDate,
                      expectedMoveOutDate: bedData.expectedMoveOutDate,
                      worker: worker.name
                    });
                  }
                  
                  return bedData;
                })
              );
              
              return {
                id: room.id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                canRentAsRoom: room.availableForRoomRental || false,
                useFloor: room.floor !== null && room.floor !== undefined,
                pricing: {
                  useCustomPricing: (room.costPerDay !== null && room.costPerDay !== undefined) || (room.costPerMonth !== null && room.costPerMonth !== undefined),
                  roomDailyPrice: room.costPerDay ? parseFloat(room.costPerDay) : null,
                  roomMonthlyPrice: room.costPerMonth ? parseFloat(room.costPerMonth) : null,
                },
                beds: bedsWithWorkers,
                roomReservation: roomReservationDetails ? {
                  leadTenant: roomReservationDetails.leadTenant,
                  occupants: roomReservationDetails.occupants,
                  monthlyRate: roomReservationDetails.roomReservation.monthlyRate,
                  checkInDate: roomReservationDetails.roomReservation.checkInDate,
                } : null,
              };
            })
          );
          
          // Calculate aggregate counts
          const totalBeds = roomsWithBeds.reduce((sum, room) => sum + room.beds.length, 0);
          const occupiedBeds = roomsWithBeds.reduce(
            (sum, room) => sum + room.beds.filter(b => b.status === "occupied").length,
            0
          );
          
          return {
            ...house,
            rooms: roomsWithBeds,
            totalBeds,
            occupiedBeds,
          };
        })
      );

      res.json(housesWithDetails);
    } catch (error) {
      console.error("Error fetching houses:", error);
      res.status(500).json({ error: "Failed to fetch houses" });
    }
  });

  // POST /houses - Create a new house (with rooms)
  apiRouter.post("/houses", async (req, res) => {
    try {
      console.log("[CREATE HOUSE] Request body:", JSON.stringify(req.body, null, 2));
      const { name, address, city, country, ownershipType, rooms } = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId || !address) {
        console.error("[CREATE HOUSE] Missing tenant context or address");
        return res.status(400).json({ error: "Tenant context and address required" });
      }

      // Map Turkish ownership type to English enum
      const mappedOwnershipType = 
        ownershipType === "Kiralık" ? "rent" :
        ownershipType === "Mülk" ? "owned" :
        ownershipType || "rent";

      console.log("[CREATE HOUSE] Creating house with data:", { tenantId, name: name || address, address, city, country, ownershipType: mappedOwnershipType });

      // Create house
      const house = await storage.createHouse({
        tenantId,
        name: name || address,
        address,
        city,
        country,
        ownershipType: mappedOwnershipType,
        status: "active",
      });
      
      console.log("[CREATE HOUSE] House created:", house.id);

      // Create rooms and beds if provided
      if (rooms && Array.isArray(rooms)) {
        console.log(`[CREATE HOUSE] Creating ${rooms.length} rooms`);
        for (let idx = 0; idx < rooms.length; idx++) {
          const roomData = rooms[idx];
          console.log(`[CREATE HOUSE] Processing room ${idx + 1}:`, roomData);
          
          // Create room
          // Handle beds: can be number (from form) or array (from API GET response)
          const bedCount = Array.isArray(roomData.beds) ? roomData.beds.length : (roomData.beds || 0);
          console.log(`[CREATE HOUSE] Bed count for room ${idx + 1}: ${bedCount}`);
          
          const createdRoom = await storage.createRoom({
            houseId: house.id,
            roomNumber: roomData.roomNumber || "",
            floor: roomData.useFloor ? roomData.floor : null,
            bedCount: bedCount,
            status: "active",
            availableForRoomRental: roomData.canRentAsRoom !== undefined ? roomData.canRentAsRoom : false,
            costPerDay: roomData.pricing?.useCustomPricing ? roomData.pricing.roomDailyPrice?.toString() : null,
            costPerMonth: roomData.pricing?.useCustomPricing ? roomData.pricing.roomMonthlyPrice?.toString() : null,
          });
          console.log(`[CREATE HOUSE] Room ${idx + 1} created:`, createdRoom.id);
          
          // Create beds for this room
          for (let i = 1; i <= bedCount; i++) {
            await storage.createBed({
              roomId: createdRoom.id,
              bedNumber: i,
              status: "available",
            });
          }
          console.log(`[CREATE HOUSE] Created ${bedCount} beds for room ${idx + 1}`);
        }
      }

      // Fetch created house with rooms and beds (using updated GET logic)
      const createdRooms = await storage.getRoomsByHouse(house.id);
      const roomsWithBeds = await Promise.all(
        createdRooms.map(async (room) => {
          const beds = await storage.getBedsByRoom(room.id);
          return {
            id: room.id,
            roomNumber: room.roomNumber,
            floor: room.floor,
            canRentAsRoom: room.availableForRoomRental || false,
            useFloor: room.floor !== null && room.floor !== undefined,
            pricing: {
              useCustomPricing: (room.costPerDay !== null && room.costPerDay !== undefined) || (room.costPerMonth !== null && room.costPerMonth !== undefined),
              roomDailyPrice: room.costPerDay ? parseFloat(room.costPerDay) : null,
              roomMonthlyPrice: room.costPerMonth ? parseFloat(room.costPerMonth) : null,
            },
            beds: beds.map(bed => ({
              id: bed.id,
              bedNumber: bed.bedNumber,
              status: bed.status || "available",
            })),
          };
        })
      );

      const response = {
        ...house,
        rooms: roomsWithBeds,
        totalBeds: roomsWithBeds.reduce((sum, room) => sum + room.beds.length, 0),
        occupiedBeds: 0,
      };

      console.log("[CREATE HOUSE] Success! House created with", roomsWithBeds.length, "rooms");
      res.json(response);
    } catch (error) {
      console.error("[CREATE HOUSE] ERROR:", error);
      console.error("[CREATE HOUSE] ERROR Stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ error: "Failed to create house" });
    }
  });

  // PATCH /houses/:id - Update house (with rooms)
  apiRouter.patch("/houses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, address, city, country, ownershipType, rooms } = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(403).json({ error: "Forbidden: No tenant context" });
      }

      // Map Turkish ownership type to English enum
      const mappedOwnershipType = 
        ownershipType === "Kiralık" ? "rent" :
        ownershipType === "Mülk" ? "owned" :
        ownershipType;

      // Ensure house belongs to tenant
      const existingHouse = await storage.getHouse(id);
      if (!existingHouse || existingHouse.tenantId !== tenantId) {
        return res.status(404).json({ error: "House not found" });
      }

      // Update house
      const house = await storage.updateHouse(id, {
        name,
        address,
        city,
        country,
        ownershipType: mappedOwnershipType,
      });

      if (!house) {
        return res.status(404).json({ error: "House not found" });
      }

      // Update rooms and beds if provided
      if (rooms && Array.isArray(rooms)) {
        const existingRooms = await storage.getRoomsByHouse(id);
        const existingRoomIds = existingRooms.map(r => r.id);
        const incomingRoomIds = rooms.filter(r => r.id).map(r => r.id);
        
        // 1. Delete rooms that are no longer in the incoming array
        const roomsToDelete = existingRooms.filter(er => !incomingRoomIds.includes(er.id));
        for (const room of roomsToDelete) {
          const beds = await storage.getBedsByRoom(room.id);
          await Promise.all(beds.map(bed => storage.deleteBed(bed.id)));
          await storage.deleteRoom(room.id);
        }
        
        // 2. Process each incoming room
        for (const roomData of rooms) {
          if (roomData.id && existingRoomIds.includes(roomData.id)) {
            // EXISTING ROOM - Update it and handle beds
            await storage.updateRoom(roomData.id, {
              roomNumber: roomData.roomNumber || "",
              floor: roomData.floor !== undefined ? roomData.floor : null,
              availableForRoomRental: roomData.canRentAsRoom !== undefined ? roomData.canRentAsRoom : false,
              costPerDay: roomData.pricing?.useCustomPricing ? roomData.pricing.roomDailyPrice?.toString() : null,
              costPerMonth: roomData.pricing?.useCustomPricing ? roomData.pricing.roomMonthlyPrice?.toString() : null,
            });
            
            // Handle beds for this existing room
            const existingBeds = await storage.getBedsByRoom(roomData.id);
            const existingBedIds = existingBeds.map(b => b.id);
            const incomingBeds = Array.isArray(roomData.beds) ? roomData.beds : [];
            const incomingBedIds = incomingBeds.filter(b => b.id).map(b => b.id);
            
            // Delete beds that are no longer in the incoming array
            const bedsToDelete = existingBeds.filter(eb => !incomingBedIds.includes(eb.id));
            await Promise.all(bedsToDelete.map(bed => storage.deleteBed(bed.id)));
            
            // Update or create beds
            for (const bedData of incomingBeds) {
              if (bedData.id && existingBedIds.includes(bedData.id)) {
                // Update existing bed (status might have changed)
                await storage.updateBed(bedData.id, {
                  bedNumber: bedData.bedNumber,
                  status: bedData.status || "available",
                });
              } else {
                // Create new bed
                await storage.createBed({
                  roomId: roomData.id,
                  bedNumber: bedData.bedNumber || incomingBeds.length + 1,
                  status: bedData.status || "available",
                });
              }
            }
          } else {
            // NEW ROOM - Create it
            const bedCount = Array.isArray(roomData.beds) ? roomData.beds.length : (roomData.beds || 0);
            
            const createdRoom = await storage.createRoom({
              houseId: id,
              roomNumber: roomData.roomNumber || "",
              floor: roomData.useFloor ? roomData.floor : null,
              bedCount: bedCount,
              status: "active",
              availableForRoomRental: roomData.canRentAsRoom !== undefined ? roomData.canRentAsRoom : false,
              costPerDay: roomData.pricing?.useCustomPricing ? roomData.pricing.roomDailyPrice?.toString() : null,
              costPerMonth: roomData.pricing?.useCustomPricing ? roomData.pricing.roomMonthlyPrice?.toString() : null,
            });
            
            // Create beds for this new room
            for (let i = 1; i <= bedCount; i++) {
              await storage.createBed({
                roomId: createdRoom.id,
                bedNumber: i,
                status: "available",
              });
            }
          }
        }
      }

      // Fetch updated house with rooms and beds
      const updatedRooms = await storage.getRoomsByHouse(id);
      const roomsWithBeds = await Promise.all(
        updatedRooms.map(async (room) => {
          const beds = await storage.getBedsByRoom(room.id);
          return {
            id: room.id,
            roomNumber: room.roomNumber,
            floor: room.floor,
            canRentAsRoom: room.availableForRoomRental || false,
            useFloor: room.floor !== null && room.floor !== undefined,
            pricing: {
              useCustomPricing: (room.costPerDay !== null && room.costPerDay !== undefined) || (room.costPerMonth !== null && room.costPerMonth !== undefined),
              roomDailyPrice: room.costPerDay ? parseFloat(room.costPerDay) : null,
              roomMonthlyPrice: room.costPerMonth ? parseFloat(room.costPerMonth) : null,
            },
            beds: beds.map(bed => ({
              id: bed.id,
              bedNumber: bed.bedNumber,
              status: bed.status || "available",
            })),
          };
        })
      );

      const response = {
        ...house,
        rooms: roomsWithBeds,
        totalBeds: roomsWithBeds.reduce((sum, room) => sum + room.beds.length, 0),
        occupiedBeds: 0,
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating house:", error);
      res.status(500).json({ error: "Failed to update house" });
    }
  });

  // DELETE /houses/:id - Delete house (cascade delete rooms)
  apiRouter.delete("/houses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(403).json({ error: "Forbidden: No tenant context" });
      }

      const house = await storage.getHouse(id);
      if (!house || house.tenantId !== tenantId) {
        return res.status(404).json({ error: "House not found" });
      }

      // Delete all rooms first
      const rooms = await storage.getRoomsByHouse(id);
      await Promise.all(rooms.map(room => storage.deleteRoom(room.id)));

      // Delete house
      const deleted = await storage.deleteHouse(id);

      if (!deleted) {
        return res.status(404).json({ error: "House not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting house:", error);
      res.status(500).json({ error: "Failed to delete house" });
    }
  });

  // GET /houses/:houseId/availability-conflicts - Check for bed availability conflicts
  apiRouter.get("/houses/:houseId/availability-conflicts", async (req, res) => {
    try {
      const { houseId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || typeof startDate !== 'string') {
        return res.status(400).json({ error: "startDate required" });
      }

      // Verify tenant context
      if (!req.tenant?.id) {
        return res.status(403).json({ error: "Tenant context required" });
      }

      // Verify house exists
      const house = await storage.getHouse(houseId);
      if (!house) {
        return res.status(404).json({ error: "House not found" });
      }
      
      if (house.tenantId !== req.tenant.id) {
        return res.status(403).json({ error: "Access denied: House belongs to different tenant" });
      }

      // Get all rooms and beds for this house
      const rooms = await storage.getRoomsByHouse(houseId);
      
      // Check availability for each bed
      const roomsWithConflicts = await Promise.all(
        rooms.map(async (room) => {
          try {
            const beds = await storage.getBedsByRoom(room.id);
            
            const bedsWithConflicts = await Promise.all(
              beds.map(async (bed) => {
                try {
                  const availability = await storage.checkBedAvailability(
                    bed.id, 
                    startDate, 
                    endDate as string | null || null
                  );
                  
                  return {
                    id: bed.id,
                    bedNumber: bed.bedNumber,
                    status: bed.status,
                    availability
                  };
                } catch (bedError) {
                  console.error(`Error checking availability for bed ${bed.id}:`, bedError);
                  // Return unavailable status if check fails
                  return {
                    id: bed.id,
                    bedNumber: bed.bedNumber,
                    status: bed.status,
                    availability: {
                      available: false,
                      conflictType: 'full' as const,
                      conflicts: []
                    }
                  };
                }
              })
            );
            
            return {
              id: room.id,
              roomNumber: room.roomNumber,
              floor: room.floor,
              beds: bedsWithConflicts
            };
          } catch (roomError) {
            console.error(`Error processing room ${room.id}:`, roomError);
            // Return empty beds array if room processing fails
            return {
              id: room.id,
              roomNumber: room.roomNumber,
              floor: room.floor,
              beds: []
            };
          }
        })
      );

      res.json({
        houseId,
        houseName: house.name,
        startDate,
        endDate: endDate || null,
        rooms: roomsWithConflicts
      });
    } catch (error) {
      console.error("Error checking availability conflicts:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        error: "Failed to check availability",
        message: errorMessage
      });
    }
  });

  // ============================================
  // RESERVATIONS / CHECK-IN/OUT ENDPOINTS
  // ============================================

  // POST /beds/:bedId/check-in - Check in worker to bed (creates both reservation and assignment)
  apiRouter.post("/beds/:bedId/check-in", async (req, res) => {
    try {
      const { bedId } = req.params;
      const { 
        employmentId, 
        startDate, 
        endDate, 
        checkInDate, 
        monthlyRate,
        depositAmount,
        depositCollected,
        depositCollector
      } = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId || !employmentId || !startDate) {
        return res.status(400).json({ error: "employmentId, startDate ve tenant bilgisi gerekli" });
      }

      // Verify employment exists and belongs to tenant
      const employment = await storage.getEmployment(employmentId);
      if (!employment || employment.tenantId !== tenantId) {
        return res.status(404).json({ error: "Employment not found or access denied" });
      }

      // Verify bed exists
      const bed = await storage.getBed(bedId);
      if (!bed) {
        console.error(`[BED CHECK-IN] Bed not found: ${bedId}`);
        return res.status(404).json({ error: "Bed not found" });
      }

      // Verify bed has valid roomId
      if (!bed.roomId) {
        console.error(`[BED CHECK-IN] Bed ${bedId} has no roomId`);
        return res.status(400).json({ error: "Bed has no associated room" });
      }

      // Verify bed belongs to tenant (check room → house)
      const room = await storage.getRoom(bed.roomId);
      if (!room) {
        console.error(`[BED CHECK-IN] Room not found for bed ${bedId}, roomId: ${bed.roomId}`);
        return res.status(404).json({ 
          error: "Room not found",
          details: `Bed references room ${bed.roomId} which does not exist`
        });
      }

      // Verify room has valid houseId
      if (!room.houseId) {
        console.error(`[BED CHECK-IN] Room ${room.id} has no houseId`);
        return res.status(400).json({ error: "Room has no associated house" });
      }

      const house = await storage.getHouse(room.houseId);
      if (!house) {
        console.error(`[BED CHECK-IN] House not found for room ${room.id}, houseId: ${room.houseId}`);
        return res.status(404).json({ 
          error: "House not found",
          details: `Room references house ${room.houseId} which does not exist`
        });
      }

      if (house.tenantId !== tenantId) {
        console.error(`[BED CHECK-IN] House ${house.id} belongs to tenant ${house.tenantId}, but request is from tenant ${tenantId}`);
        return res.status(403).json({ error: "House not found or access denied" });
      }

      // CHECK: Room must not have an active room reservation (blocks individual bed rentals)
      const roomReservation = await storage.getActiveRoomReservationForRoom(room.id);
      if (roomReservation) {
        return res.status(400).json({ 
          error: "Bu oda tümüyle kiralanmış - yatak olarak kiraya verilemez"
        });
      }

      // Check if bed has active reservation
      const activeReservation = await storage.getActiveReservationForBed(bedId);
      if (activeReservation) {
        return res.status(400).json({ error: "Bed already has an active reservation" });
      }

      // Create reservation with house and room info
      const finalCheckInDate = checkInDate || startDate;
      console.log(`[BED CHECK-IN] Creating reservation for bed ${bedId}:`, {
        employmentId,
        bedId,
        startDate,
        endDate,
        checkInDate: finalCheckInDate,
        checkInDateParam: checkInDate,
        startDateParam: startDate
      });
      
      const reservation = await storage.createReservation({
        employmentId,
        houseId: house.id,
        roomId: room.id,
        bedId,
        tenantId,
        startDate: startDate,
        endDate: endDate || null,
        checkInDate: finalCheckInDate,
        checkOutDate: null,
        status: "checked_in", // Use correct enum value
      });
      
      console.log(`[BED CHECK-IN] Reservation created:`, {
        id: reservation.id,
        bedId: reservation.bedId,
        checkInDate: reservation.checkInDate,
        startDate: reservation.startDate,
        checkOutDate: reservation.checkOutDate,
        status: reservation.status
      });
      
      // Verify reservation was created correctly by fetching it back
      const verifyReservations = await storage.getReservationsByBed(bedId);
      console.log(`[BED CHECK-IN] Verification: Found ${verifyReservations.length} reservation(s) for bed ${bedId}:`, 
        verifyReservations.map(r => ({
          id: r.id,
          checkInDate: r.checkInDate,
          checkOutDate: r.checkOutDate,
          startDate: r.startDate,
          endDate: r.endDate
        }))
      );

      // Create assignment for Accommodation Management tracking
      const assignment = await storage.createAssignment({
        tenantId,
        employmentId,
        houseId: house.id,
        roomId: room.id,
        bedId,
        startDate: startDate,
        endDate: endDate || null,
        monthlyRate: monthlyRate || 600, // Default if not provided
        status: "active",
        depositCollected: depositCollected || false,
        depositAmount: depositAmount ? String(depositAmount) : "0",
        depositCollector: depositCollector || null,
        depositStatus: depositCollected ? "collected" : "pending",
      });

      res.json({ reservation, assignment });
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // POST /rooms/:roomId/check-in - Check in to entire room (whole room rental)
  apiRouter.post("/rooms/:roomId/check-in", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { 
        leadEmploymentId,  // Primary worker/contact (optional for non-worker rentals)
        occupants,         // Array of {employmentId?, guestName?, guestGender?}
        startDate, 
        endDate, 
        checkInDate, 
        monthlyRate,
        depositAmount,
        depositCollected,
        depositCollector
      } = req.body;
      const tenantId = req.tenant?.id;

      console.log("[ROOM CHECK-IN] Request body:", JSON.stringify(req.body, null, 2));

      if (!startDate || !tenantId) {
        console.error("[ROOM CHECK-IN] Missing startDate or tenant context");
        return res.status(400).json({ error: "startDate ve tenant bilgisi gerekli" });
      }

      if (!occupants || !Array.isArray(occupants) || occupants.length === 0) {
        console.error("[ROOM CHECK-IN] No occupants provided:", occupants);
        return res.status(400).json({ error: "At least one occupant required" });
      }

      // Validate each occupant has either employmentId OR (guestName + guestGender)
      for (let i = 0; i < occupants.length; i++) {
        const occ = occupants[i];
        const hasWorker = !!occ.employmentId;
        const hasGuest = !!(occ.guestName && occ.guestName.trim() && occ.guestGender);
        
        console.log(`[ROOM CHECK-IN] Validating occupant ${i + 1}:`, { 
          hasWorker, 
          hasGuest, 
          employmentId: occ.employmentId,
          guestName: occ.guestName,
          guestGender: occ.guestGender
        });
        
        if (!hasWorker && !hasGuest) {
          console.error(`[ROOM CHECK-IN] Invalid occupant ${i + 1}:`, occ);
          return res.status(400).json({ 
            error: `Occupant ${i + 1} must have either employmentId or both guestName and guestGender` 
          });
        }
      }

      // Verify room exists
      const room = await storage.getRoom(roomId);
      if (!room) {
        console.error(`[ROOM CHECK-IN] Room not found: ${roomId}`);
        return res.status(404).json({ error: "Room not found" });
      }

      // CHECK: Room must be available for room rental
      if (!room.availableForRoomRental) {
        return res.status(400).json({ 
          error: "This room is not available for whole-room rental"
        });
      }

      // Verify room has valid houseId
      if (!room.houseId) {
        console.error(`[ROOM CHECK-IN] Room ${room.id} has no houseId`);
        return res.status(400).json({ error: "Room has no associated house" });
      }

      // Verify room belongs to tenant (check house)
      const house = await storage.getHouse(room.houseId);
      if (!house) {
        console.error(`[ROOM CHECK-IN] House not found for room ${room.id}, houseId: ${room.houseId}`);
        return res.status(404).json({ 
          error: "House not found",
          details: `Room references house ${room.houseId} which does not exist`
        });
      }

      if (house.tenantId !== tenantId) {
        console.error(`[ROOM CHECK-IN] House ${house.id} belongs to tenant ${house.tenantId}, but request is from tenant ${tenantId}`);
        return res.status(403).json({ error: "House not found or access denied" });
      }

      // Get all beds in this room
      const beds = await storage.getBedsByRoom(roomId);
      if (!beds || beds.length === 0) {
        return res.status(404).json({ error: "No beds found in this room" });
      }

      // CHECK: Room must not already have a room reservation (room-first architecture)
      // This single check makes all beds unavailable if room is rented
      const existingRoomReservation = await storage.getActiveRoomReservationForRoom(roomId);
      if (existingRoomReservation) {
        console.log("[ROOM CHECK-IN] Room already has active room reservation:", existingRoomReservation.id);
        return res.status(400).json({ 
          error: "Bu oda zaten oda olarak kiralanmış"
        });
      }

      // CHECK: No individual bed-level reservations should exist
      // Note: checkBedAvailability() now checks room reservations first (room-first architecture)
      console.log(`[ROOM CHECK-IN] Checking ${beds.length} beds for conflicts using room-first validation`);
      const bedConflicts = await Promise.all(
        beds.map(async (bed) => {
          const availability = await storage.checkBedAvailability(bed.id, startDate, endDate || null);
          console.log(`[ROOM CHECK-IN] Bed ${bed.bedNumber} (${bed.id}):`, {
            available: availability.available,
            conflictType: availability.conflictType,
            conflictsCount: availability.conflicts.length
          });
          return {
            bed,
            available: availability.available,
            conflicts: availability.conflicts
          };
        })
      );
      
      const unavailableBed = bedConflicts.find(b => !b.available);
      if (unavailableBed) {
        console.error(`[ROOM CHECK-IN] Bed ${unavailableBed.bed.bedNumber} is unavailable:`, unavailableBed.conflicts);
        return res.status(400).json({ 
          error: `Yatak ${unavailableBed.bed.bedNumber} müsait değil - oda kiralama için tüm yatakların boş olması gerekiyor`,
          conflicts: unavailableBed.conflicts
        });
      }

      // Verify lead employment if provided
      if (leadEmploymentId) {
        const employment = await storage.getEmployment(leadEmploymentId);
        if (!employment || employment.tenantId !== tenantId) {
          return res.status(404).json({ error: "Lead employment not found or access denied" });
        }
      }

      // Create room reservation
      const roomReservation = await storage.createRoomReservation({
        tenantId,
        houseId: house.id,
        roomId: room.id,
        leadEmploymentId: leadEmploymentId || null,
        startDate,
        endDate: endDate || null,
        checkInDate: checkInDate || startDate,
        checkOutDate: null,
        status: "active",
        monthlyRate: monthlyRate ? String(monthlyRate) : null,
        depositAmount: depositAmount ? String(depositAmount) : null,
        depositCollected: depositCollected || false,
        depositDate: depositCollected ? startDate : null,
      });

      // Create occupant records
      const occupantRecords = [];
      for (const occupant of occupants) {
        const occupantRecord = await storage.createRoomReservationOccupant({
          roomReservationId: roomReservation.id,
          employmentId: occupant.employmentId || null,
          guestName: occupant.guestName || null,
          guestGender: occupant.guestGender || null,
          notes: occupant.notes || null,
        });
        occupantRecords.push(occupantRecord);
      }

      // Link all beds to this room reservation
      for (const bed of beds) {
        await storage.updateBed(bed.id, {
          roomReservationId: roomReservation.id,
          status: "occupied"
        });
      }

      res.json({ 
        roomReservation,
        occupants: occupantRecords,
        bedsUpdated: beds.length,
        message: `Oda başarıyla kiralandı - ${beds.length} yatak ${occupantRecords.length} kişi için rezerve edildi`
      });
    } catch (error) {
      console.error("[ROOM CHECK-IN] Error checking in to room:", error);
      console.error("[ROOM CHECK-IN] Error stack:", error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({ 
        error: "Failed to check in to room",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // GET /beds/:bedId/future-reservations - Get future reservations for a bed
  apiRouter.get("/beds/:bedId/future-reservations", async (req, res) => {
    try {
      const { bedId } = req.params;
      const { afterDate } = req.query;
      const tenantId = req.tenant?.id;

      if (!afterDate || typeof afterDate !== 'string') {
        return res.status(400).json({ error: "afterDate query parameter required" });
      }

      // Verify bed exists
      const bed = await storage.getBed(bedId);
      if (!bed) {
        console.error(`[FUTURE RESERVATIONS] Bed not found: ${bedId}`);
        return res.status(404).json({ error: "Bed not found" });
      }

      if (!bed.roomId) {
        console.error(`[FUTURE RESERVATIONS] Bed ${bedId} has no roomId`);
        return res.status(400).json({ error: "Bed has no associated room" });
      }

      const room = await storage.getRoom(bed.roomId);
      if (!room) {
        console.error(`[FUTURE RESERVATIONS] Room not found for bed ${bedId}, roomId: ${bed.roomId}`);
        return res.status(404).json({ 
          error: "Room not found",
          details: `Bed references room ${bed.roomId} which does not exist`
        });
      }

      if (!room.houseId) {
        console.error(`[FUTURE RESERVATIONS] Room ${room.id} has no houseId`);
        return res.status(400).json({ error: "Room has no associated house" });
      }

      const house = await storage.getHouse(room.houseId);
      if (!house) {
        console.error(`[FUTURE RESERVATIONS] House not found for room ${room.id}, houseId: ${room.houseId}`);
        return res.status(404).json({ 
          error: "House not found",
          details: `Room references house ${room.houseId} which does not exist`
        });
      }

      if (!tenantId || house.tenantId !== tenantId) {
        return res.status(403).json({ error: "Bu yatağın rezervasyonlarını görüntüleme izniniz yok" });
      }

      // Get future reservations for this bed
      const futureReservations = await storage.getFutureReservationsForBed(bedId, afterDate);

      res.json(futureReservations);
    } catch (error) {
      console.error("Error fetching future reservations:", error);
      res.status(500).json({ error: "Failed to fetch future reservations" });
    }
  });

  // GET /reservations - Get reservations by filters
  apiRouter.get("/reservations", async (req, res) => {
    try {
      const { bedId, active } = req.query;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }

      let reservations;

      if (bedId) {
        // Ensure bed belongs to tenant before returning reservations
        const bed = await storage.getBed(bedId as string);
        if (!bed) {
          console.error(`[GET RESERVATIONS] Bed not found: ${bedId}`);
          return res.status(404).json({ error: "Bed not found" });
        }

        if (!bed.roomId) {
          console.error(`[GET RESERVATIONS] Bed ${bedId} has no roomId`);
          return res.status(400).json({ error: "Bed has no associated room" });
        }

        const room = await storage.getRoom(bed.roomId);
        if (!room) {
          console.error(`[GET RESERVATIONS] Room not found for bed ${bedId}, roomId: ${bed.roomId}`);
          return res.status(404).json({ 
            error: "Room not found",
            details: `Bed references room ${bed.roomId} which does not exist`
          });
        }

        if (!room.houseId) {
          console.error(`[GET RESERVATIONS] Room ${room.id} has no houseId`);
          return res.status(400).json({ error: "Room has no associated house" });
        }

        const house = await storage.getHouse(room.houseId);
        if (!house) {
          console.error(`[GET RESERVATIONS] House not found for room ${room.id}, houseId: ${room.houseId}`);
          return res.status(404).json({ 
            error: "House not found",
            details: `Room references house ${room.houseId} which does not exist`
          });
        }

        if (house.tenantId !== tenantId) {
          return res.status(403).json({ error: "Bu yatağı görüntüleme izniniz yok" });
        }

        // Get reservations for specific bed (filtered by tenant for safety)
        const bedReservations = await storage.getReservationsByBed(bedId as string);
        reservations = bedReservations.filter((reservation) => reservation.tenantId === tenantId);
      } else if (active === "true") {
        // Get active reservations for tenant
        reservations = await storage.getActiveReservationsByTenant(tenantId);
      } else {
        // Get all reservations for tenant (not implemented yet)
        return res.status(400).json({ error: "Must specify bedId or active=true" });
      }

      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  // ============================================
  // QR Codes Endpoints
  // ============================================

  // GET /qr-codes - Get all QR codes for tenant
  apiRouter.get("/qr-codes", async (req, res) => {
    try {
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const qrCodes = await storage.getQRCodesByTenant(tenantId);
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  });

  // POST /qr-codes - Create new QR code
  apiRouter.post("/qr-codes", async (req, res) => {
    try {
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const qrCode = await storage.createQRCode({ ...req.body, tenantId });
      res.status(201).json(qrCode);
    } catch (error) {
      console.error("Error creating QR code:", error);
      res.status(500).json({ error: "Failed to create QR code" });
    }
  });

  // PATCH /qr-codes/:id - Update QR code
  apiRouter.patch("/qr-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getQRCode(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "QR code not found" });
      }
      const { tenantId: _ignoredTenantId, ...rest } = req.body;
      const updated = await storage.updateQRCode(id, rest);
      if (!updated) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating QR code:", error);
      res.status(500).json({ error: "Failed to update QR code" });
    }
  });

  // DELETE /qr-codes/:id - Delete QR code
  apiRouter.delete("/qr-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getQRCode(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "QR code not found" });
      }
      const deleted = await storage.deleteQRCode(id);
      if (!deleted) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.status(500).json({ error: "Failed to delete QR code" });
    }
  });

  // POST /qr-codes/:code/use - Increment usage count
  apiRouter.post("/qr-codes/:code/use", async (req, res) => {
    try {
      const { code } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const qrCode = await storage.getQRCodeByCode(code);
      if (!qrCode || qrCode.tenantId !== tenantId) {
        return res.status(404).json({ error: "QR code not found" });
      }
      
      // Check if expired or disabled
      if (qrCode.status !== "active") {
        return res.status(400).json({ error: "QR code is not active" });
      }
      
      // Check usage limit
      if (qrCode.usageLimit !== null && qrCode.usedCount >= qrCode.usageLimit) {
        return res.status(400).json({ error: "QR code usage limit reached" });
      }
      
      const updated = await storage.incrementQRUsage(qrCode.id);
      res.json(updated);
    } catch (error) {
      console.error("Error using QR code:", error);
      res.status(500).json({ error: "Failed to use QR code" });
    }
  });

  // ============================================
  // ASSIGNMENT MANAGEMENT ROUTES
  // ============================================
  
  // GET /tenants/:tenantId/assignments - Get all assignments for tenant
  apiRouter.get("/tenants/:tenantId/assignments", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant'a erişim izniniz yok" });
      }
      const assignments = await storage.getAssignmentsByTenant(currentTenantId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  // GET /assignments/:id - Get single assignment
  apiRouter.get("/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const assignment = await storage.getAssignment(id);
      if (!assignment || assignment.tenantId !== tenantId) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ error: "Failed to fetch assignment" });
    }
  });

  // POST /tenants/:tenantId/assignments - Create assignment
  apiRouter.post("/tenants/:tenantId/assignments", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant için assignment oluşturma izniniz yok" });
      }
      const assignment = await storage.createAssignment({ ...req.body, tenantId: currentTenantId });
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  // PATCH /assignments/:id - Update assignment
  apiRouter.patch("/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getAssignment(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const updated = await storage.updateAssignment(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  // DELETE /assignments/:id - Delete assignment
  apiRouter.delete("/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getAssignment(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const deleted = await storage.deleteAssignment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  // ============================================
  // CHARGES ROUTES
  // ============================================
  
  // GET /tenants/:tenantId/charges - Get all charges for tenant
  apiRouter.get("/tenants/:tenantId/charges", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant'a erişim izniniz yok" });
      }
      const charges = await storage.getChargesByTenant(currentTenantId);
      res.json(charges);
    } catch (error) {
      console.error("Error fetching charges:", error);
      res.status(500).json({ error: "Failed to fetch charges" });
    }
  });

  // GET /charges/:id - Get single charge
  apiRouter.get("/charges/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const charge = await storage.getCharge(id);
      if (!charge || charge.tenantId !== tenantId) {
        return res.status(404).json({ error: "Charge not found" });
      }
      res.json(charge);
    } catch (error) {
      console.error("Error fetching charge:", error);
      res.status(500).json({ error: "Failed to fetch charge" });
    }
  });

  // POST /tenants/:tenantId/charges - Create charge
  apiRouter.post("/tenants/:tenantId/charges", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant için charge oluşturma izniniz yok" });
      }
      const charge = await storage.createCharge({ ...req.body, tenantId: currentTenantId });
      res.status(201).json(charge);
    } catch (error) {
      console.error("Error creating charge:", error);
      res.status(500).json({ error: "Failed to create charge" });
    }
  });

  // PATCH /charges/:id - Update charge
  apiRouter.patch("/charges/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getCharge(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "Charge not found" });
      }
      const updated = await storage.updateCharge(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Charge not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating charge:", error);
      res.status(500).json({ error: "Failed to update charge" });
    }
  });

  // DELETE /charges/:id - Delete charge
  apiRouter.delete("/charges/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getCharge(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "Charge not found" });
      }
      const deleted = await storage.deleteCharge(id);
      if (!deleted) {
        return res.status(404).json({ error: "Charge not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting charge:", error);
      res.status(500).json({ error: "Failed to delete charge" });
    }
  });

  // ============================================
  // PAYMENTS ROUTES
  // ============================================
  
  // GET /tenants/:tenantId/payments - Get all payments for tenant
  apiRouter.get("/tenants/:tenantId/payments", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant'a erişim izniniz yok" });
      }
      const payments = await storage.getPaymentsByTenant(currentTenantId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // GET /payments/:id - Get single payment
  apiRouter.get("/payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const payment = await storage.getPayment(id);
      if (!payment || payment.tenantId !== tenantId) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });

  // POST /tenants/:tenantId/payments - Create payment
  apiRouter.post("/tenants/:tenantId/payments", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant için payment oluşturma izniniz yok" });
      }
      const payment = await storage.createPayment({ ...req.body, tenantId: currentTenantId });
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // DELETE /payments/:id - Delete payment
  apiRouter.delete("/payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }
      const existing = await storage.getPayment(id);
      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: "Payment not found" });
      }
      const deleted = await storage.deletePayment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  // ============================================
  // RESERVATION ENDPOINTS
  // ============================================

  // PATCH /reservations/:id/check-out - Update reservation checkout date
  apiRouter.patch("/reservations/:id/check-out", authenticateTenantUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { checkOutDate, checkOutType, notes, vacationStart, vacationEnd } = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }

      // Get existing reservation
      const reservation = await storage.getReservation(id);
      if (!reservation || reservation.tenantId !== tenantId) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      // Room reservation checkout validation (prevent orphaning occupants)
      const checkoutValidation = await storage.checkRoomReservationForCheckout(
        reservation.employmentId,
        reservation.bedId
      );

      if (!checkoutValidation.canCheckout) {
        return res.status(400).json({
          error: checkoutValidation.reason || "Cannot checkout due to room reservation constraints",
          otherOccupants: checkoutValidation.otherOccupants,
          isLeadTenant: checkoutValidation.isLeadTenant
        });
      }

      // Check for overlapping reservations if changing checkout date
      if (checkOutDate && checkOutDate !== reservation.checkOutDate) {
        const futureReservations = await storage.getFutureReservationsForBed(
          reservation.bedId,
          reservation.checkInDate || new Date().toISOString().split('T')[0]
        );
        
        // Filter out current reservation and check for conflicts
        const conflicts = futureReservations.filter(r => {
          if (r.id === id) return false; // Skip current reservation
          
          const conflictStart = r.checkInDate || r.startDate;
          const conflictEnd = r.checkOutDate || r.endDate;
          
          if (!conflictStart) return false;
          
          // Check if new checkout date falls within another reservation
          return checkOutDate >= conflictStart && 
                 (!conflictEnd || checkOutDate <= conflictEnd);
        });

        if (conflicts.length > 0) {
          return res.status(409).json({ 
            error: "Checkout date conflicts with another reservation",
            conflicts 
          });
        }
      }

      // Update reservation
      const updates: Partial<InsertReservation> = {
        checkOutDate,
      };

      // Add note if provided
      if (notes) {
        const existingNotes = reservation.notes || [];
        updates.notes = [...existingNotes, `[${checkOutType}] ${notes}`];
      }

      // Handle vacation type
      if (checkOutType === 'vacation' && vacationStart && vacationEnd) {
        const existingNotes = updates.notes || reservation.notes || [];
        updates.notes = [
          ...existingNotes,
          `Vacation: ${vacationStart} to ${vacationEnd}`
        ];
      }

      const updated = await storage.updateReservation(id, updates);
      
      if (!updated) {
        return res.status(500).json({ error: "Failed to update reservation" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating reservation checkout:", error);
      res.status(500).json({ error: "Failed to update checkout date" });
    }
  });

  // POST /reservations/:id/notes - Add note to reservation
  apiRouter.post("/reservations/:id/notes", authenticateTenantUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }

      if (!note || !note.trim()) {
        return res.status(400).json({ error: "Note is required" });
      }

      // Get existing reservation
      const reservation = await storage.getReservation(id);
      if (!reservation || reservation.tenantId !== tenantId) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      // Append note with timestamp
      const timestamp = new Date().toISOString();
      const existingNotes = reservation.notes || [];
      const newNote = `[${timestamp}] ${note}`;
      
      const updated = await storage.updateReservation(id, {
        notes: [...existingNotes, newNote]
      });

      if (!updated) {
        return res.status(500).json({ error: "Failed to add note" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error adding reservation note:", error);
      res.status(500).json({ error: "Failed to add note" });
    }
  });

  // GET /reservations/:id/notes - Get reservation notes
  apiRouter.get("/reservations/:id/notes", authenticateTenantUser, async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
      }

      const reservation = await storage.getReservation(id);
      if (!reservation || reservation.tenantId !== tenantId) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      res.json({ notes: reservation.notes || [] });
    } catch (error) {
      console.error("Error fetching reservation notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  // ============================================
  // ASSIGNMENT NOTES ROUTES
  // ============================================

  // GET /tenants/:tenantId/assignments/:assignmentId/notes - Get notes for assignment
  apiRouter.get("/tenants/:tenantId/assignments/:assignmentId/notes", async (req, res) => {
    try {
      const { tenantId, assignmentId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant'a erişim izniniz yok" });
      }
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment || assignment.tenantId !== currentTenantId) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const notes = await storage.getAssignmentNotesByAssignment(assignmentId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching assignment notes:", error);
      res.status(500).json({ error: "Failed to fetch assignment notes" });
    }
  });

  // POST /tenants/:tenantId/assignments/:assignmentId/notes - Create note
  apiRouter.post("/tenants/:tenantId/assignments/:assignmentId/notes", async (req, res) => {
    try {
      const { tenantId, assignmentId } = req.params;
      const currentTenantId = req.tenant?.id;
      if (!currentTenantId || tenantId !== currentTenantId) {
        return res.status(403).json({ error: "Bu tenant için not oluşturma izniniz yok" });
      }
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment || assignment.tenantId !== currentTenantId) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      const note = await storage.createAssignmentNote({ ...req.body, tenantId: currentTenantId, assignmentId });
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating assignment note:", error);
      res.status(500).json({ error: "Failed to create assignment note" });
    }
  });

  // Register API router with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
