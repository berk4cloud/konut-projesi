import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken, type AuthRequest } from "./middleware/auth";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { houses, rooms, beds, reservations, workers } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, tenantEmail } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Get tenant info
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Generate token
      const token = generateToken(user.id, user.tenantId, user.email);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all houses with rooms and beds for a tenant
  app.get("/api/houses", verifyToken, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const { date, city, showEmptyOnly } = req.query;

      // Build where clause for houses
      const whereConditions: any[] = [eq(houses.tenantId, tenantId)];
      
      // Apply city filter if provided
      if (city) {
        whereConditions.push(eq(houses.city, city as string));
      }

      // Get houses for tenant with optional city filter
      const housesData = await db.query.houses.findMany({
        where: whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0],
        with: {
          rooms: {
            with: {
              beds: true,
            },
          },
        },
      });

      // Get all active reservations for the date
      const dateStr = (date as string) || new Date().toISOString().split('T')[0];
      const activeReservations = await db.query.reservations.findMany({
        where: (reservations, { eq, and, lte, gte, or, isNull }) => 
          and(
            eq(reservations.tenantId, tenantId),
            or(
              and(
                lte(reservations.startDate, dateStr),
                or(
                  gte(reservations.endDate, dateStr),
                  isNull(reservations.endDate)
                )
              )
            )
          ),
        with: {
          worker: true,
        },
      });

      // Map reservations by bed ID
      const reservationsByBed = new Map();
      activeReservations.forEach(res => {
        reservationsByBed.set(res.bedId, res);
      });

      // Enrich houses with reservation data
      const enrichedHouses = housesData.map(house => {
        const enrichedRooms = house.rooms.map(room => {
          const enrichedBeds = room.beds.map(bed => {
            const reservation = reservationsByBed.get(bed.id);
            // A bed is occupied if there's an active reservation, regardless of bed.status
            const isOccupied = !!reservation;
            
            return {
              ...bed,
              status: isOccupied ? "occupied" : (bed.status === "oos" ? "oos" : "available"),
              worker: isOccupied && reservation.worker ? {
                id: reservation.worker.id,
                name: `${reservation.worker.firstName} ${reservation.worker.lastName}`,
                gender: reservation.worker.gender,
              } : undefined,
            };
          });

          return {
            ...room,
            beds: enrichedBeds,
          };
        });

        const totalBeds = enrichedRooms.reduce((sum, room) => sum + room.beds.length, 0);
        const occupiedBeds = enrichedRooms.reduce(
          (sum, room) => sum + room.beds.filter(b => b.status === "occupied").length,
          0
        );
        const emptyBeds = enrichedRooms.reduce(
          (sum, room) => sum + room.beds.filter(b => b.status === "available").length,
          0
        );

        return {
          ...house,
          rooms: enrichedRooms,
          totalBeds,
          occupiedBeds,
          emptyBeds,
        };
      });

      // Apply showEmptyOnly filter
      let filteredHouses = enrichedHouses;
      if (showEmptyOnly === "true") {
        filteredHouses = enrichedHouses.filter(h => h.emptyBeds > 0);
      }

      // Calculate capacity from filtered houses
      const totalBeds = filteredHouses.reduce((sum, h) => sum + h.totalBeds, 0);
      const occupiedBeds = filteredHouses.reduce((sum, h) => sum + h.occupiedBeds, 0);
      const emptyBeds = totalBeds - occupiedBeds;
      const oosBeds = filteredHouses.reduce(
        (sum, h) => sum + h.rooms.reduce(
          (s, r) => s + r.beds.filter((b: any) => b.status === "oos").length,
          0
        ),
        0
      );

      res.json({
        success: true,
        data: {
          totalHouses: filteredHouses.length,
          totalBeds,
          emptyBeds,
          occupiedBeds,
          oosBeds,
          houses: filteredHouses,
        },
      });
    } catch (error) {
      console.error("Get houses error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get workers for a tenant
  app.get("/api/workers", verifyToken, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const workersData = await storage.getWorkers(tenantId);

      res.json({
        success: true,
        data: workersData,
      });
    } catch (error) {
      console.error("Get workers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create reservation
  app.post("/api/reservations", verifyToken, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const { workerId, bedId, startDate, endDate, dailyRate } = req.body;

      if (!workerId || !bedId || !startDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get bed with room and house info
      const bed = await db.query.beds.findFirst({
        where: eq(beds.id, bedId),
        with: {
          room: {
            with: {
              house: true,
            },
          },
        },
      });

      if (!bed) {
        return res.status(404).json({ error: "Bed not found" });
      }

      // CRITICAL: Verify bed belongs to the same tenant
      if (bed.room.house.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "You cannot book a bed from another tenant",
        });
      }

      // Check for date conflicts
      const conflicts = await storage.getReservationsByBed(bedId, startDate);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: "Date conflict",
          message: "This bed is already reserved for the selected dates",
        });
      }

      // Check gender conflicts in room (scoped to tenant)
      const roomReservations = await db.query.reservations.findMany({
        where: (reservations, { eq, and, lte, gte, or, isNull }) => 
          and(
            eq(reservations.tenantId, tenantId),
            eq(reservations.roomId, bed.roomId),
            or(
              and(
                lte(reservations.startDate, startDate),
                or(
                  gte(reservations.endDate, startDate),
                  isNull(reservations.endDate)
                )
              )
            )
          ),
        with: {
          worker: true,
        },
      });

      // Get the worker being assigned
      const worker = await db.query.workers.findFirst({
        where: eq(workers.id, workerId),
      });

      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }

      // CRITICAL: Verify worker belongs to the same tenant
      if (worker.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "You cannot assign a worker from another tenant",
        });
      }

      // Check for gender conflicts
      const genderConflict = roomReservations.some(res => 
        res.worker.gender !== worker.gender &&
        res.worker.lastName !== worker.lastName
      );

      if (genderConflict) {
        return res.status(409).json({
          error: "Gender conflict",
          message: "Different genders with different surnames in the same room",
          requiresConfirmation: true,
        });
      }

      // Create reservation
      const reservation = await storage.createReservation({
        workerId,
        bedId,
        roomId: bed.roomId,
        houseId: bed.room.houseId,
        tenantId,
        startDate,
        endDate: endDate || null,
        status: "confirmed",
        dailyRate: dailyRate || "30.00",
        createdBy: req.user!.id,
      });

      // Update bed status (with tenant verification via join)
      await db.update(beds)
        .set({ status: "occupied", lastOccupiedBy: workerId, lastOccupiedAt: new Date() })
        .where(
          and(
            eq(beds.id, bedId),
            eq(beds.roomId, bed.roomId)
          )
        );

      res.json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      console.error("Create reservation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
