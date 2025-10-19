import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from "express";
import { storage } from "./storage";
import { 
  insertWorkerProfileSchema, 
  insertEmploymentSchema,
  insertEmploymentPrivateDataSchema,
  type User,
  type Tenant
} from "@shared/schema";
import { z } from "zod";
import { requireTenant } from "./middleware/tenant";
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
      
      // 1. Check if platform admin
      const admin = await storage.getPlatformAdminByEmail(email);
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
      const userRecords = await storage.getUsersByEmail(email);
      
      if (userRecords.length === 0) {
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }
      
      // 3. Verify password using first record (password is same across all tenants)
      const firstUser = userRecords[0];
      if (!firstUser.password) {
        return res.status(403).json({ 
          error: "Şifre ayarlanmamış",
          message: "Lütfen önce şifrenizi ayarlayın"
        });
      }
      
      const isValid = await verifyPassword(password, firstUser.password);
      if (!isValid) {
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
  // FEDERATED WORKER IDENTITY ENDPOINTS
  // ============================================

  // POST /workers - Create new worker (profile + employment + private data)
  // This creates a federated worker with all associated records
  apiRouter.post("/workers", async (req, res) => {
    try {
      const tenantId = req.body.tenantId || "cova"; // Default tenant for now

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
      const tenantId = req.query.tenantId as string;

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

          // Return in legacy format for compatibility
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

  // GET /workers/:employmentId - Get specific worker by employmentId
  apiRouter.get("/workers/:employmentId", async (req, res) => {
    try {
      const { employmentId } = req.params;

      const employment = await storage.getEmployment(employmentId);
      if (!employment) {
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
      
      const updateSchema = z.object({
        status: z.enum(["active", "inactive", "former", "invited"]).optional(),
        endDate: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        department: z.string().nullable().optional(),
      });

      const updates = updateSchema.parse(req.body);

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
      
      const employments = await storage.getEmploymentsByWorkerProfile(workerProfileId);
      
      res.json(employments);
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
      
      const tenant = await storage.getTenant(id);
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Map snake_case to camelCase for frontend compatibility
      const response = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
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
      
      console.log("PATCH /tenants/:id - Request body:", updates);
      
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
      const tenantId = req.query.tenantId as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId required" });
      }

      const houses = await storage.getHousesByTenant(tenantId);
      
      // Fetch rooms, beds, and reservations for each house
      const housesWithDetails = await Promise.all(
        houses.map(async (house) => {
          const rooms = await storage.getRoomsByHouse(house.id);
          
          // For each room, fetch beds with their active reservations
          const roomsWithBeds = await Promise.all(
            rooms.map(async (room) => {
              const beds = await storage.getBedsByRoom(room.id);
              
              // For each bed, fetch active reservation and enrich with worker data
              const bedsWithWorkers = await Promise.all(
                beds.map(async (bed) => {
                  const reservation = await storage.getActiveReservationForBed(bed.id);
                  
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
                  
                  // Calculate bed status based on reservation
                  let status = bed.status || "available";
                  if (reservation && !reservation.checkOutDate) {
                    status = reservation.checkInDate ? "occupied" : "reserved";
                  }
                  
                  return {
                    id: bed.id,
                    bedNumber: bed.bedNumber,
                    status,
                    worker,
                    expectedMoveOutDate: reservation?.endDate || undefined,
                    expectedMoveInDate: reservation?.startDate || undefined,
                  };
                })
              );
              
              return {
                id: room.id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                beds: bedsWithWorkers,
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
      const { tenantId, name, address, city, country, ownershipType, rooms } = req.body;

      if (!tenantId || !address) {
        console.error("[CREATE HOUSE] Missing tenantId or address");
        return res.status(400).json({ error: "tenantId and address required" });
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

      // Map Turkish ownership type to English enum
      const mappedOwnershipType = 
        ownershipType === "Kiralık" ? "rent" :
        ownershipType === "Mülk" ? "owned" :
        ownershipType;

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
        // Delete existing rooms (cascade will delete beds)
        const existingRooms = await storage.getRoomsByHouse(id);
        for (const room of existingRooms) {
          // Delete beds first
          const beds = await storage.getBedsByRoom(room.id);
          await Promise.all(beds.map(bed => storage.deleteBed(bed.id)));
          // Delete room
          await storage.deleteRoom(room.id);
        }
        
        // Create new rooms and beds
        for (const roomData of rooms) {
          // Handle beds: can be number (from form) or array (from API GET response)
          const bedCount = Array.isArray(roomData.beds) ? roomData.beds.length : (roomData.beds || 0);
          
          const createdRoom = await storage.createRoom({
            houseId: id,
            roomNumber: roomData.roomNumber || "",
            floor: roomData.useFloor ? roomData.floor : null,
            bedCount: bedCount,
            status: "active",
          });
          
          // Create beds for this room
          for (let i = 1; i <= bedCount; i++) {
            await storage.createBed({
              roomId: createdRoom.id,
              bedNumber: i,
              status: "available",
            });
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

  // ============================================
  // RESERVATIONS / CHECK-IN/OUT ENDPOINTS
  // ============================================

  // POST /beds/:bedId/check-in - Check in worker to bed
  apiRouter.post("/beds/:bedId/check-in", async (req, res) => {
    try {
      const { bedId } = req.params;
      const { employmentId, startDate, endDate, checkInDate, tenantId } = req.body;

      if (!employmentId || !startDate || !tenantId) {
        return res.status(400).json({ error: "employmentId, startDate, and tenantId required" });
      }

      // Verify employment exists and belongs to tenant
      const employment = await storage.getEmployment(employmentId);
      if (!employment || employment.tenantId !== tenantId) {
        return res.status(404).json({ error: "Employment not found or access denied" });
      }

      // Verify bed exists
      const bed = await storage.getBed(bedId);
      if (!bed) {
        return res.status(404).json({ error: "Bed not found" });
      }

      // Verify bed belongs to tenant (check room → house)
      const room = await storage.getRoom(bed.roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      const house = await storage.getHouse(room.houseId);
      if (!house || house.tenantId !== tenantId) {
        return res.status(404).json({ error: "House not found or access denied" });
      }

      // Check if bed has active reservation
      const activeReservation = await storage.getActiveReservationForBed(bedId);
      if (activeReservation) {
        return res.status(400).json({ error: "Bed already has an active reservation" });
      }

      // Create reservation
      const reservation = await storage.createReservation({
        employmentId,
        bedId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
        checkOutDate: null,
        status: "active",
      });

      res.json(reservation);
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // PATCH /reservations/:id/check-out - Check out worker from bed
  apiRouter.patch("/reservations/:id/check-out", async (req, res) => {
    try {
      const { id } = req.params;
      const { checkOutDate, tenantId } = req.body;

      if (!tenantId) {
        return res.status(400).json({ error: "tenantId required" });
      }

      // Verify reservation exists
      const reservation = await storage.getReservation(id);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      // Verify reservation belongs to tenant (check employment)
      const employment = await storage.getEmployment(reservation.employmentId);
      if (!employment || employment.tenantId !== tenantId) {
        return res.status(404).json({ error: "Reservation not found or access denied" });
      }

      if (reservation.checkOutDate) {
        return res.status(400).json({ error: "Reservation already checked out" });
      }

      // Complete reservation
      const updated = await storage.completeReservation(
        id,
        checkOutDate ? new Date(checkOutDate) : new Date()
      );

      res.json(updated);
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ error: "Failed to check out" });
    }
  });

  // GET /reservations - Get reservations by filters
  apiRouter.get("/reservations", async (req, res) => {
    try {
      const { tenantId, bedId, active } = req.query;

      if (!tenantId) {
        return res.status(400).json({ error: "tenantId required" });
      }

      let reservations;

      if (bedId) {
        // Get reservations for specific bed
        reservations = await storage.getReservationsByBed(bedId as string);
      } else if (active === "true") {
        // Get active reservations for tenant
        reservations = await storage.getActiveReservationsByTenant(tenantId as string);
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
      const { tenantId } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId required" });
      }
      const qrCodes = await storage.getQRCodesByTenant(tenantId as string);
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  });

  // POST /qr-codes - Create new QR code
  apiRouter.post("/qr-codes", async (req, res) => {
    try {
      const qrCode = await storage.createQRCode(req.body);
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
      const updated = await storage.updateQRCode(id, req.body);
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
      const qrCode = await storage.getQRCodeByCode(code);
      if (!qrCode) {
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
      const assignments = await storage.getAssignmentsByTenant(tenantId);
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
      const assignment = await storage.getAssignment(id);
      if (!assignment) {
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
      const assignment = await storage.createAssignment({ ...req.body, tenantId });
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
      const charges = await storage.getChargesByTenant(tenantId);
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
      const charge = await storage.getCharge(id);
      if (!charge) {
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
      const charge = await storage.createCharge({ ...req.body, tenantId });
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
      const payments = await storage.getPaymentsByTenant(tenantId);
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
      const payment = await storage.getPayment(id);
      if (!payment) {
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
      const payment = await storage.createPayment({ ...req.body, tenantId });
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
  // ASSIGNMENT NOTES ROUTES
  // ============================================

  // GET /tenants/:tenantId/assignments/:assignmentId/notes - Get notes for assignment
  apiRouter.get("/tenants/:tenantId/assignments/:assignmentId/notes", async (req, res) => {
    try {
      const { assignmentId } = req.params;
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
      const note = await storage.createAssignmentNote({ ...req.body, tenantId, assignmentId });
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
