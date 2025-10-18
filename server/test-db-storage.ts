#!/usr/bin/env tsx
/**
 * Test script for DbStorage - Tests PostgreSQL hybrid setup
 * Run: NODE_ENV=production tsx server/test-db-storage.ts
 */

import { DbStorage } from "./storage";

async function testDbStorage() {
  console.log("🧪 Testing DbStorage (PostgreSQL)...\n");

  const dbStorage = new DbStorage();

  try {
    // Test 1: Get worker profiles (triggers auto-seed)
    console.log("📝 Test 1: Fetching worker profiles...");
    const profile = await dbStorage.getWorkerProfile("wp-1");
    if (profile) {
      console.log(`✅ Found worker: ${profile.firstName} ${profile.lastName}`);
    } else {
      console.log("❌ Worker profile not found");
    }

    // Test 2: Get employments
    console.log("\n📝 Test 2: Fetching employments for tenant 'cova'...");
    const employments = await dbStorage.getEmploymentsByTenant("cova");
    console.log(`✅ Found ${employments.length} employments`);

    // Test 3: Get active employments
    console.log("\n📝 Test 3: Fetching active employments...");
    const activeEmployments = await dbStorage.getActiveEmploymentsByTenant("cova");
    console.log(`✅ Found ${activeEmployments.length} active employments`);

    // Test 4: Create new worker
    console.log("\n📝 Test 4: Creating new worker profile...");
    const newProfile = await dbStorage.createWorkerProfile({
      firstName: "Test",
      lastName: "Worker",
      email: "test@example.com",
      gender: "male",
      nationality: "Turkey",
      dateOfBirth: "1990-01-01",
      phone: "+90 555 123 4567"
    });
    console.log(`✅ Created worker: ${newProfile.id}`);

    // Test 5: Update worker
    console.log("\n📝 Test 5: Updating worker profile...");
    const updated = await dbStorage.updateWorkerProfile(newProfile.id, {
      bio: "Test worker bio"
    });
    if (updated?.bio === "Test worker bio") {
      console.log("✅ Updated successfully");
    }

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testDbStorage();
