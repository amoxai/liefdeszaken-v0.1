-- =============================================
-- LIEFDESZAKEN DATABASE RESET SCRIPT
-- Run this BEFORE schema.sql to clean up existing objects
-- =============================================

-- Drop storage policies first
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view banners" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view rewards images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload rewards images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete banners" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete rewards images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update banners" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update rewards images" ON storage.objects;

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS on_product_price_change ON products;
DROP TRIGGER IF EXISTS on_stock_change ON products;
DROP TRIGGER IF EXISTS set_order_number ON orders;
DROP TRIGGER IF EXISTS on_loyalty_transaction ON loyalty_transactions;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS track_price_change() CASCADE;
DROP FUNCTION IF EXISTS check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_loyalty_points() CASCADE;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS stock_alerts CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_rewards CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS b2b_customer_prices CASCADE;
DROP TABLE IF EXISTS b2b_price_lists CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS reward_type CASCADE;
DROP TYPE IF EXISTS loyalty_transaction_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Now you can run schema.sql
