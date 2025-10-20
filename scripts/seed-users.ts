/**
 * Seed script to create initial users with hashed passwords
 *
 * Usage:
 *   npx tsx scripts/seed-users.ts
 */

import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  username: string;
  display_name: string;
  password: string;
}

const USERS: User[] = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    username: "tkz",
    display_name: "TKZ",
    password: "password123", // Default password - MUST BE CHANGED
  },
  {
    id: "b1ffcd00-ad1c-5fg9-cc7e-7cc0ce491b22",
    username: "kobo",
    display_name: "コボちゃん",
    password: "password123", // Default password - MUST BE CHANGED
  },
];

async function seedUsers() {
  console.log("🌱 Seeding users...\n");

  for (const user of USERS) {
    try {
      // Generate password hash
      const password_hash = await bcrypt.hash(user.password, 10);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", user.username)
        .single();

      if (existingUser) {
        console.log(`⚠️  User "${user.username}" already exists. Skipping...`);
        continue;
      }

      // Insert user
      const { error } = await supabase
        .from("users")
        .insert({
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          password_hash,
        } as any);

      if (error) {
        throw error;
      }

      console.log(`✓ Created user: ${user.username} (${user.display_name})`);
      console.log(`  ID: ${user.id}`);
      console.log(
        `  Default password: ${user.password} (MUST BE CHANGED)\n`
      );
    } catch (error) {
      console.error(`✗ Failed to create user "${user.username}":`, error);
    }
  }

  console.log("✓ User seeding completed!");
}

// Run the seed function
seedUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
