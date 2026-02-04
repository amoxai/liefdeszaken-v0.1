-- =============================================
-- LIEFDESZAKEN COMPLETE DATABASE SETUP
-- Run this single file to set up everything
-- =============================================

-- =============================================
-- PART 1: RESET (Clean up existing objects)
-- =============================================

-- Drop storage policies first (these are safe to drop even if they don't exist)
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

-- Drop RLS policies on profiles (if table exists)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
    DROP POLICY IF EXISTS "Employee can view profiles" ON profiles;
    DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, nothing to drop
    NULL;
END $$;

-- Drop functions first (CASCADE will handle dependent triggers)
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS track_price_change() CASCADE;
DROP FUNCTION IF EXISTS check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_loyalty_points() CASCADE;

-- Drop tables (CASCADE handles foreign keys and dependent objects)
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

-- =============================================
-- PART 2: SCHEMA
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('admin', 'employee', 'b2b', 'consumer', 'guest');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE loyalty_transaction_type AS ENUM ('earned', 'redeemed', 'expired', 'adjusted');
CREATE TYPE reward_type AS ENUM ('discount', 'free_shipping', 'free_product', 'percentage');

-- PROFILES TABLE
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'consumer' NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    company_name TEXT,
    vat_number TEXT,
    vat_validated BOOLEAN DEFAULT FALSE,
    loyalty_points INTEGER DEFAULT 0,
    b2b_price_list_id UUID,
    can_order_on_invoice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES TABLE
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    street TEXT NOT NULL,
    house_number TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Nederland' NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_billing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku TEXT UNIQUE,
    barcode TEXT,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    weight DECIMAL(10,2),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT IMAGES TABLE
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B2B PRICE LISTS TABLE
CREATE TABLE b2b_price_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD CONSTRAINT fk_b2b_price_list 
    FOREIGN KEY (b2b_price_list_id) REFERENCES b2b_price_lists(id) ON DELETE SET NULL;

-- B2B CUSTOMER PRICES TABLE
CREATE TABLE b2b_customer_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    custom_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_email TEXT,
    status order_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    payment_method TEXT,
    payment_intent_id TEXT,
    shipping_street TEXT,
    shipping_house_number TEXT,
    shipping_postal_code TEXT,
    shipping_city TEXT,
    shipping_country TEXT,
    billing_street TEXT,
    billing_house_number TEXT,
    billing_postal_code TEXT,
    billing_city TEXT,
    billing_country TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_used INTEGER DEFAULT 0,
    notes TEXT,
    tracking_number TEXT,
    is_b2b BOOLEAN DEFAULT FALSE,
    invoice_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOYALTY REWARDS TABLE
CREATE TABLE loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type reward_type NOT NULL,
    reward_value DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOYALTY TRANSACTIONS TABLE
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    type loyalty_transaction_type NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICE HISTORY TABLE
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK ALERTS TABLE
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update all profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Employee can view profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Addresses
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all addresses" ON addresses FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));

-- Categories
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can view all products" ON products FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Employee can update products" ON products FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employee'));

-- Product Images
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin can manage product images" ON product_images FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- B2B Price Lists
CREATE POLICY "B2B users can view their price list" ON b2b_price_lists FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND b2b_price_list_id = b2b_price_lists.id));
CREATE POLICY "Admin can manage price lists" ON b2b_price_lists FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- B2B Customer Prices
CREATE POLICY "B2B users can view their prices" ON b2b_customer_prices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage customer prices" ON b2b_customer_prices FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Staff can view all orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "Staff can update orders" ON orders FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "Admin can delete orders" ON orders FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Order Items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Staff can view all order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "Insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Loyalty Rewards
CREATE POLICY "Anyone can view active rewards" ON loyalty_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage rewards" ON loyalty_rewards FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Loyalty Transactions
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage loyalty transactions" ON loyalty_transactions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Price History
CREATE POLICY "Staff can view price history" ON price_history FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "System can insert price history" ON price_history FOR INSERT WITH CHECK (true);

-- Stock Alerts
CREATE POLICY "Staff can view stock alerts" ON stock_alerts FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));
CREATE POLICY "Staff can update stock alerts" ON stock_alerts FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));

-- FUNCTIONS & TRIGGERS

-- Handle new user with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, first_name, last_name, loyalty_points, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'consumer'::user_role,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
        last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail - user creation should still succeed
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.price != NEW.price THEN
        INSERT INTO price_history (product_id, old_price, new_price, changed_by)
        VALUES (NEW.id, OLD.price, NEW.price, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_product_price_change AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION track_price_change();

CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity <= NEW.low_stock_threshold THEN
        INSERT INTO stock_alerts (product_id, current_stock, threshold)
        VALUES (NEW.id, NEW.stock_quantity, NEW.low_stock_threshold)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_stock_change AFTER UPDATE OF stock_quantity ON products FOR EACH ROW EXECUTE FUNCTION check_low_stock();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO order_count FROM orders;
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET loyalty_points = loyalty_points + NEW.points WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_loyalty_transaction AFTER INSERT ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION update_loyalty_points();

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('banners', 'banners', true),
  ('logos', 'logos', true),
  ('rewards-images', 'rewards-images', true)
ON CONFLICT DO NOTHING;

-- STORAGE POLICIES
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public can view category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Public can view banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public can view rewards images" ON storage.objects FOR SELECT USING (bucket_id = 'rewards-images');

CREATE POLICY "Admin can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can upload banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can upload rewards images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'rewards-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'category-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete rewards images" ON storage.objects FOR DELETE USING (bucket_id = 'rewards-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'category-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update rewards images" ON storage.objects FOR UPDATE USING (bucket_id = 'rewards-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- PART 3: SEED DATA
-- =============================================

-- Categories
INSERT INTO categories (id, name, slug, description, image_url, is_active, position) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Romantische Cadeaus', 'romantische-cadeaus', 'Prachtige romantische cadeaus voor je geliefde', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400', true, 1),
  ('a2222222-2222-2222-2222-222222222222', 'Valentijn', 'valentijn', 'Speciale Valentijnsdag collectie', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400', true, 2),
  ('a3333333-3333-3333-3333-333333333333', 'Sieraden', 'sieraden', 'Mooie sieraden voor elke gelegenheid', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', true, 3),
  ('a4444444-4444-4444-4444-444444444444', 'Bloemen & Planten', 'bloemen-planten', 'Verse bloemen en planten', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', true, 4),
  ('a5555555-5555-5555-5555-555555555555', 'Chocolade & Snoep', 'chocolade-snoep', 'Heerlijke zoetigheden', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', true, 5);

-- Products
INSERT INTO products (id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, category_id, is_active, is_featured) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Hartvormige Ketting', 'hartvormige-ketting', 'Een prachtige hartvormige ketting gemaakt van sterling zilver. Perfect als cadeau voor je geliefde op speciale momenten.', 'Sterling zilveren hartvormige ketting', 49.99, 59.99, 'JEW-001', 50, 'a3333333-3333-3333-3333-333333333333', true, true),
  ('b2222222-2222-2222-2222-222222222222', 'Romantisch Rozenboeket', 'romantisch-rozenboeket', 'Een prachtig boeket van 12 rode rozen, symbool van liefde en passie. Inclusief elegant inpakpapier en een persoonlijke kaart.', 'Boeket van 12 rode rozen', 34.99, NULL, 'FLO-001', 25, 'a4444444-4444-4444-4444-444444444444', true, true),
  ('b3333333-3333-3333-3333-333333333333', 'Luxe Chocolade Hartjes', 'luxe-chocolade-hartjes', 'Handgemaakte Belgische chocolade hartjes in een elegante geschenkdoos. Bevat 20 stuks in diverse smaken.', 'Belgische chocolade hartjes - 20 stuks', 24.99, 29.99, 'CHO-001', 100, 'a5555555-5555-5555-5555-555555555555', true, true),
  ('b4444444-4444-4444-4444-444444444444', 'Valentijns Cadeau Set', 'valentijns-cadeau-set', 'Complete Valentijns cadeau set inclusief chocolade, een knuffelbeertje en een persoonlijk kaartje. De perfecte verrassing!', 'Complete Valentijns cadeau set', 59.99, 79.99, 'VAL-001', 30, 'a2222222-2222-2222-2222-222222222222', true, true),
  ('b5555555-5555-5555-5555-555555555555', 'Gepersonaliseerde Armband', 'gepersonaliseerde-armband', 'Elegante armband met de mogelijkheid om een naam of datum te graveren. Gemaakt van roestvrij staal met gouden afwerking.', 'Gepersonaliseerde armband met gravering', 39.99, NULL, 'JEW-002', 40, 'a3333333-3333-3333-3333-333333333333', true, false),
  ('b6666666-6666-6666-6666-666666666666', 'Romantisch Fotoalbum', 'romantisch-fotoalbum', 'Luxe fotoalbum met ruimte voor 100 fotos. Voorzien van een mooie omslag met Love tekst en hartjes.', 'Luxe fotoalbum - 100 fotos', 29.99, 34.99, 'ROM-001', 60, 'a1111111-1111-1111-1111-111111111111', true, false),
  ('b7777777-7777-7777-7777-777777777777', 'Eeuwige Roos in Glas', 'eeuwige-roos-in-glas', 'Geconserveerde roos in een glazen stolp die jarenlang mooi blijft. Inclusief LED verlichting voor een magisch effect.', 'Geconserveerde roos met LED', 44.99, 54.99, 'FLO-002', 35, 'a4444444-4444-4444-4444-444444444444', true, true),
  ('b8888888-8888-8888-8888-888888888888', 'Love Letters Set', 'love-letters-set', 'Set van 12 voorgedrukte liefdesbrieven in een houten kistje. Open elke maand een nieuwe brief vol romantiek.', '12 romantische brieven', 27.99, NULL, 'ROM-002', 45, 'a1111111-1111-1111-1111-111111111111', true, false),
  ('b9999999-9999-9999-9999-999999999999', 'Chocolade Fondue Set', 'chocolade-fondue-set', 'Complete chocolade fondue set voor een romantisch avondje. Inclusief 500g Belgische chocolade en fruit spiesjes.', 'Fondue set met chocolade', 42.99, 49.99, 'CHO-002', 25, 'a5555555-5555-5555-5555-555555555555', true, false),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hartjes Oorbellen', 'hartjes-oorbellen', 'Delicate hartjes oorbellen van sterling zilver met zirkonia steentjes. Hypoallergeen en geschikt voor gevoelige oren.', 'Sterling zilver met zirkonia', 32.99, 39.99, 'JEW-003', 55, 'a3333333-3333-3333-3333-333333333333', true, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Luxe Giftbox - Romantiek', 'luxe-giftbox-romantiek', 'Premium giftbox met chocolade truffels, rozenblaadjes zeep, geurkaarsen en een zijden oogmasker. Luxe verpakt.', 'Premium romantische giftbox', 79.99, 99.99, 'ROM-003', 20, 'a1111111-1111-1111-1111-111111111111', true, true),
  ('bccccccc-cccc-cccc-cccc-cccccccccccc', 'Gemengd Seizoensboeket', 'gemengd-seizoensboeket', 'Prachtig gemengd boeket met seizoensbloemen in romantische kleuren. Elke week een andere samenstelling.', 'Seizoensbloemen mix', 28.99, NULL, 'FLO-003', 30, 'a4444444-4444-4444-4444-444444444444', true, false);

-- Product Images (using Unsplash placeholders)
INSERT INTO product_images (product_id, url, alt_text, position) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', 'Hartvormige ketting', 0),
  ('b2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600', 'Rozenboeket', 0),
  ('b3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600', 'Chocolade hartjes', 0),
  ('b4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600', 'Valentijns cadeau set', 0),
  ('b5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600', 'Gepersonaliseerde armband', 0),
  ('b6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 'Romantisch fotoalbum', 0),
  ('b7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600', 'Eeuwige roos in glas', 0),
  ('b8888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1579783483458-83d02f1aaca7?w=600', 'Love letters set', 0),
  ('b9999999-9999-9999-9999-999999999999', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600', 'Chocolade fondue set', 0),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 'Hartjes oorbellen', 0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600', 'Luxe giftbox', 0),
  ('bccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600', 'Gemengd seizoensboeket', 0);

-- Loyalty Rewards
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, reward_value, is_active) VALUES
  ('5% Korting', 'Ontvang 5% korting op je volgende bestelling', 100, 'percentage', 5.00, true),
  ('10% Korting', 'Ontvang 10% korting op je volgende bestelling', 200, 'percentage', 10.00, true),
  ('Gratis Verzending', 'Gratis verzending op je volgende bestelling', 150, 'free_shipping', 0.00, true),
  ('5 Euro Korting', 'Ontvang 5 euro korting op je volgende bestelling', 75, 'discount', 5.00, true),
  ('10 Euro Korting', 'Ontvang 10 euro korting op je volgende bestelling', 150, 'discount', 10.00, true);

-- =============================================
-- SETUP COMPLETE!
-- Now create admin user via Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: dev@amoxai.com, Password: admin123
-- 4. Check "Auto Confirm"
-- 5. Run setup-admin.sql to set admin role
-- =============================================
