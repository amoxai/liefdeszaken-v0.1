-- =============================================
-- ADMIN USER SETUP SCRIPT
-- Run this AFTER schema.sql has been executed
-- =============================================

-- Step 1: Create the admin user in auth.users (if not done via Dashboard)
-- NOTE: You may need to create the user via Supabase Dashboard first:
-- Go to Authentication > Users > Add User
-- Email: dev@amoxai.com
-- Password: admin123
-- Auto Confirm: Yes

-- Step 2: Create the admin profile
INSERT INTO profiles (id, email, first_name, last_name, role, loyalty_points, created_at, updated_at)
SELECT 
  id,
  'dev@amoxai.com',
  'Dev',
  'Admin',
  'admin',
  0,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'dev@amoxai.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  first_name = 'Dev',
  last_name = 'Admin',
  updated_at = NOW();

-- Verify the admin was created
SELECT id, email, role, first_name, last_name FROM profiles WHERE email = 'dev@amoxai.com';
