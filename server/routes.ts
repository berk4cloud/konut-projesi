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
      const tenantId = req.query.tenantId as string || "cova";

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

  // Register API router with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
