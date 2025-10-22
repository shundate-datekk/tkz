-- Seed initial users (TKZ and コボちゃん)
-- Created: 2025-01-20
--
-- Note: Password hashes are generated using bcrypt with 10 rounds
-- Default passwords (MUST BE CHANGED IN PRODUCTION):
-- - TKZ: password123
-- - コボちゃん: password123

-- Insert TKZ user
INSERT INTO users (id, username, display_name, password_hash)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'tkz',
  'TKZ',
  '$2a$10$YourHashHere' -- This will be replaced by actual hash in seed script
) ON CONFLICT (username) DO NOTHING;

-- Insert コボちゃん user
INSERT INTO users (id, username, display_name, password_hash)
VALUES (
  'b1ffcd00-ad1c-5fg9-cc7e-7cc0ce491b22'::uuid,
  'kobo',
  'コボちゃん',
  '$2a$10$YourHashHere' -- This will be replaced by actual hash in seed script
) ON CONFLICT (username) DO NOTHING;

-- Note: You should run the seed script (scripts/seed-users.ts) to generate
-- proper bcrypt hashes and update the users table with secure passwords.
