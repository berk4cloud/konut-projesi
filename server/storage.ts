import {
  users,
  houses,
  rooms,
  beds,
  workers,
  reservations,
  tenants,
  type User,
  type InsertUser,
  type House,
  type Room,
  type Bed,
  type Worker,
  type Reservation,
  type Tenant,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tenant methods
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantByEmail(email: string): Promise<Tenant | undefined>;

  // House methods
  getHouses(tenantId: string, filters?: {
    date?: string;
    city?: string;
    showEmptyOnly?: boolean;
  }): Promise<House[]>;
  getHouseWithRooms(houseId: string): Promise<any>;

  // Worker methods
  getWorkers(tenantId: string): Promise<Worker[]>;
  createWorker(worker: any): Promise<Worker>;

  // Reservation methods
  createReservation(reservation: any): Promise<Reservation>;
  getReservationsByBed(bedId: string, date: string): Promise<Reservation[]>;
  getReservationsByRoom(roomId: string): Promise<Reservation[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantByEmail(email: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
    return tenant || undefined;
  }

  async getHouses(tenantId: string, filters?: {
    date?: string;
    city?: string;
    showEmptyOnly?: boolean;
  }): Promise<House[]> {
    let query = db.select().from(houses).where(eq(houses.tenantId, tenantId));
    
    if (filters?.city) {
      query = query.where(eq(houses.city, filters.city));
    }

    return await query;
  }

  async getHouseWithRooms(houseId: string): Promise<any> {
    const house = await db.query.houses.findFirst({
      where: eq(houses.id, houseId),
      with: {
        rooms: {
          with: {
            beds: true,
          },
        },
      },
    });
    return house;
  }

  async getWorkers(tenantId: string): Promise<Worker[]> {
    return await db.select().from(workers).where(eq(workers.tenantId, tenantId));
  }

  async createWorker(worker: any): Promise<Worker> {
    const [newWorker] = await db.insert(workers).values(worker).returning();
    return newWorker;
  }

  async createReservation(reservation: any): Promise<Reservation> {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }

  async getReservationsByBed(bedId: string, date: string): Promise<Reservation[]> {
    return await db.select().from(reservations).where(
      and(
        eq(reservations.bedId, bedId),
        or(
          and(
            lte(reservations.startDate, date),
            or(
              gte(reservations.endDate, date),
              isNull(reservations.endDate)
            )
          )
        )
      )
    );
  }

  async getReservationsByRoom(roomId: string): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.roomId, roomId));
  }
}

export const storage = new DatabaseStorage();
