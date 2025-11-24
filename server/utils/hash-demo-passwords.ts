/**
 * Utility to hash demo passwords with bcrypt
 * Run this once to update demo data with real hashed passwords
 */

import bcrypt from "bcryptjs";
import { db } from "../db";
import { platformAdmins, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

// Demo passwords (plaintext)
const DEMO_PASSWORDS = {
  // Platform admins
  "tahir@arpdo.com": "SecurePass123",
  "admin@arpdo.com": "AdminPass123",
  
  // Tenant users
  "ahmet.yilmaz@cova-bv.com": "password123",
  "jan@cova.nl": "CovaPass123",
  "lisa@cova.nl": "LisaPass123",
  "tim@apple.nl": "ApplePass123",
  "sophie@oneflex.nl": "OneFlexPass123",
};

async function hashDemoPasswords() {
  console.log("🔐 Hashing demo passwords...");
  
  // Hash all passwords
  const hashedPasswords: Record<string, string> = {};
  for (const [email, password] of Object.entries(DEMO_PASSWORDS)) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    hashedPasswords[email] = hashed;
    console.log(`  ✓ Hashed password for ${email}`);
  }
  
  // Update platform admins
  console.log("\n📝 Updating platform admins...");
  await db.update(platformAdmins)
    .set({ password: hashedPasswords["tahir@arpdo.com"] })
    .where(eq(platformAdmins.email, "tahir@arpdo.com"));
  console.log("  ✓ Updated tahir@arpdo.com");
  
  await db.update(platformAdmins)
    .set({ password: hashedPasswords["admin@arpdo.com"] })
    .where(eq(platformAdmins.email, "admin@arpdo.com"));
  console.log("  ✓ Updated admin@arpdo.com");
  
  // Update tenant users
  console.log("\n📝 Updating tenant users...");
  for (const email of ["ahmet.yilmaz@cova-bv.com", "jan@cova.nl", "lisa@cova.nl", "tim@apple.nl", "sophie@oneflex.nl"]) {
    await db.update(users)
      .set({ password: hashedPasswords[email] })
      .where(eq(users.email, email));
    console.log(`  ✓ Updated ${email}`);
  }
  
  console.log("\n✅ All demo passwords hashed successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("Platform Admin: tahir@arpdo.com / SecurePass123");
  console.log("Demo User: ahmet.yilmaz@cova-bv.com / password123");
  console.log("Cova Owner: jan@cova.nl / CovaPass123");
  console.log("Apple Owner: tim@apple.nl / ApplePass123");
  console.log("OneFlex Owner: sophie@oneflex.nl / OneFlexPass123");
}

hashDemoPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error hashing passwords:", error);
    process.exit(1);
  });
