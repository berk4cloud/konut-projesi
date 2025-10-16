import { db } from "../server/db";
import { tenants, users, houses, rooms, beds, workers, reservations } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create tenants
  const [cova, oneflex, covagmbh] = await db.insert(tenants).values([
    { name: "Cova B.V.", email: "contact@cova.nl" },
    { name: "Oneflex B.V.", email: "contact@oneflex.nl" },
    { name: "Cova GmbH", email: "contact@covagmbh.de" },
  ]).returning();

  console.log("✅ Created 3 tenants");

  // Create users
  const hashedPassword = await bcrypt.hash("demo123", 10);
  await db.insert(users).values([
    {
      tenantId: cova.id,
      email: "admin@cova.nl",
      password: hashedPassword,
      name: "Admin Cova",
      role: "admin",
    },
    {
      tenantId: oneflex.id,
      email: "admin@oneflex.nl",
      password: hashedPassword,
      name: "Admin Oneflex",
      role: "admin",
    },
    {
      tenantId: covagmbh.id,
      email: "admin@covagmbh.de",
      password: hashedPassword,
      name: "Admin Cova GmbH",
      role: "admin",
    },
  ]);

  console.log("✅ Created 3 admin users");

  // Create houses for Cova
  const [house1, house2, house3] = await db.insert(houses).values([
    {
      tenantId: cova.id,
      name: "Geldernstrasse 13",
      address: "Geldernstrasse",
      houseNumber: "13",
      postalCode: "52511",
      city: "Geilenkirchen",
      country: "DE",
      totalRooms: 3,
      totalBeds: 7,
      status: "active",
    },
    {
      tenantId: cova.id,
      name: "Hauptstrasse 45",
      address: "Hauptstrasse",
      houseNumber: "45",
      postalCode: "5801",
      city: "Venlo",
      country: "NL",
      totalRooms: 2,
      totalBeds: 6,
      status: "active",
    },
    {
      tenantId: cova.id,
      name: "Marktplatz 7",
      address: "Marktplatz",
      houseNumber: "7",
      postalCode: "6041",
      city: "Roermond",
      country: "NL",
      totalRooms: 2,
      totalBeds: 5,
      status: "active",
    },
  ]).returning();

  console.log("✅ Created 3 houses");

  // Create rooms for house 1
  const [room1, room2, room3] = await db.insert(rooms).values([
    { houseId: house1.id, roomNumber: "45", floor: 2, bedCount: 3, roomType: "shared" },
    { houseId: house1.id, roomNumber: "46", floor: 2, bedCount: 2, roomType: "shared" },
    { houseId: house1.id, roomNumber: "47", floor: 3, bedCount: 2, roomType: "shared" },
  ]).returning();

  // Create rooms for house 2
  const [room4, room5] = await db.insert(rooms).values([
    { houseId: house2.id, roomNumber: "101", floor: 1, bedCount: 4, roomType: "shared" },
    { houseId: house2.id, roomNumber: "102", floor: 1, bedCount: 2, roomType: "shared" },
  ]).returning();

  // Create rooms for house 3
  const [room6, room7] = await db.insert(rooms).values([
    { houseId: house3.id, roomNumber: "201", floor: 2, bedCount: 3, roomType: "shared" },
    { houseId: house3.id, roomNumber: "202", floor: 2, bedCount: 2, roomType: "shared" },
  ]).returning();

  console.log("✅ Created 7 rooms");

  // Create beds for all rooms
  await db.insert(beds).values([
    // Room 45 (3 beds)
    { roomId: room1.id, bedNumber: 1, status: "occupied" },
    { roomId: room1.id, bedNumber: 2, status: "available" },
    { roomId: room1.id, bedNumber: 3, status: "occupied" },
    // Room 46 (2 beds)
    { roomId: room2.id, bedNumber: 1, status: "available" },
    { roomId: room2.id, bedNumber: 2, status: "reserved" },
    // Room 47 (2 beds)
    { roomId: room3.id, bedNumber: 1, status: "occupied" },
    { roomId: room3.id, bedNumber: 2, status: "oos" },
    // Room 101 (4 beds)
    { roomId: room4.id, bedNumber: 1, status: "occupied" },
    { roomId: room4.id, bedNumber: 2, status: "occupied" },
    { roomId: room4.id, bedNumber: 3, status: "available" },
    { roomId: room4.id, bedNumber: 4, status: "available" },
    // Room 102 (2 beds)
    { roomId: room5.id, bedNumber: 1, status: "occupied" },
    { roomId: room5.id, bedNumber: 2, status: "available" },
    // Room 201 (3 beds)
    { roomId: room6.id, bedNumber: 1, status: "occupied" },
    { roomId: room6.id, bedNumber: 2, status: "available" },
    { roomId: room6.id, bedNumber: 3, status: "occupied" },
    // Room 202 (2 beds)
    { roomId: room7.id, bedNumber: 1, status: "available" },
    { roomId: room7.id, bedNumber: 2, status: "reserved" },
  ]);

  console.log("✅ Created 18 beds");

  // Create workers
  const workerData = await db.insert(workers).values([
    {
      tenantId: cova.id,
      firstName: "Canny",
      lastName: "Smith",
      gender: "male",
      email: "canny@example.com",
      nationality: "NL",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "Sarah",
      lastName: "Johnson",
      gender: "female",
      email: "sarah@example.com",
      nationality: "DE",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "Mike",
      lastName: "Brown",
      gender: "male",
      email: "mike@example.com",
      nationality: "PL",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "John",
      lastName: "Davis",
      gender: "male",
      email: "john@example.com",
      nationality: "RO",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "Emma",
      lastName: "Wilson",
      gender: "female",
      email: "emma@example.com",
      nationality: "NL",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "Tom",
      lastName: "Miller",
      gender: "male",
      email: "tom@example.com",
      nationality: "DE",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "Lisa",
      lastName: "Anderson",
      gender: "female",
      email: "lisa@example.com",
      nationality: "PL",
      status: "active",
    },
    {
      tenantId: cova.id,
      firstName: "Paul",
      lastName: "Taylor",
      gender: "male",
      email: "paul@example.com",
      nationality: "RO",
      status: "active",
    },
  ]).returning();

  console.log("✅ Created 8 workers");

  // Get all beds
  const allBeds = await db.select().from(beds);
  const occupiedBeds = allBeds.filter(b => b.status === "occupied");

  // Create reservations for occupied beds
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const endDate = nextMonth.toISOString().split('T')[0];

  for (let i = 0; i < occupiedBeds.length && i < workerData.length; i++) {
    const bed = occupiedBeds[i];
    const worker = workerData[i];
    
    // Find room and house for this bed
    const roomData = await db.query.rooms.findFirst({
      where: (rooms, { eq }) => eq(rooms.id, bed.roomId),
    });

    if (roomData) {
      await db.insert(reservations).values({
        workerId: worker.id,
        bedId: bed.id,
        roomId: bed.roomId,
        houseId: roomData.houseId,
        tenantId: cova.id,
        startDate: today,
        endDate: endDate,
        status: "checked_in",
        dailyRate: "30.00",
      });
    }
  }

  console.log("✅ Created reservations");
  console.log("🎉 Seed completed successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
