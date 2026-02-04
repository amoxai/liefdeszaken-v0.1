-- =============================================
-- LIEFDESZAKEN E-COMMERCE DATABASE SCHEMA
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'employee', 'b2b', 'consumer', 'guest');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE loyalty_transaction_type AS ENUM ('earned', 'redeemed', 'expired', 'adjusted');
CREATE TYPE reward_type AS ENUM ('discount', 'free_shipping', 'free_product', 'percentage');

-- =============================================
-- USER PROFILES TABLE
-- =============================================

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

-- =============================================
-- ADDRESSES TABLE
-- =============================================

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

-- =============================================
-- CATEGORIES TABLE
-- =============================================

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

-- =============================================
-- PRODUCTS TABLE
-- =============================================

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

-- =============================================
-- PRODUCT IMAGES TABLE
-- =============================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- B2B PRICE LISTS TABLE
-- =============================================

CREATE TABLE b2b_price_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles
ALTER TABLE profiles ADD CONSTRAINT fk_b2b_price_list 
    FOREIGN KEY (b2b_price_list_id) REFERENCES b2b_price_lists(id) ON DELETE SET NULL;

-- =============================================
-- B2B CUSTOMER PRICES TABLE (Custom prices per customer/product)
-- =============================================

CREATE TABLE b2b_customer_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    custom_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_email TEXT,
    status order_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    payment_method TEXT,
    payment_intent_id TEXT,
    
    -- Shipping Address (stored as JSON for guest orders)
    shipping_street TEXT,
    shipping_house_number TEXT,
    shipping_postal_code TEXT,
    shipping_city TEXT,
    shipping_country TEXT,
    
    -- Billing Address
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

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================

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

-- =============================================
-- LOYALTY REWARDS TABLE
-- =============================================

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

-- =============================================
-- LOYALTY TRANSACTIONS TABLE
-- =============================================

CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    type loyalty_transaction_type NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRICE HISTORY TABLE
-- =============================================

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STOCK ALERTS TABLE
-- =============================================

CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

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

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
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

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can update all profiles
CREATE POLICY "Admin can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Employee can view customer profiles
CREATE POLICY "Employee can view profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- =============================================
-- ADDRESSES POLICIES
-- =============================================

-- Users can manage their own addresses
CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Admin/Employee can view all addresses
CREATE POLICY "Staff can view all addresses" ON addresses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- =============================================
-- CATEGORIES POLICIES (Public read, Admin write)
-- =============================================

CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- PRODUCTS POLICIES (Public read, Admin/Employee write)
-- =============================================

CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "Admin can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Employee can update products" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'employee'
        )
    );

-- =============================================
-- PRODUCT IMAGES POLICIES
-- =============================================

CREATE POLICY "Anyone can view product images" ON product_images
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage product images" ON product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- B2B PRICE LISTS POLICIES
-- =============================================

CREATE POLICY "B2B users can view their price list" ON b2b_price_lists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND b2b_price_list_id = b2b_price_lists.id
        )
    );

CREATE POLICY "Admin can manage price lists" ON b2b_price_lists
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- B2B CUSTOMER PRICES POLICIES
-- =============================================

CREATE POLICY "B2B users can view their prices" ON b2b_customer_prices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage customer prices" ON b2b_customer_prices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- ORDERS POLICIES
-- =============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admin/Employee can view all orders
CREATE POLICY "Staff can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Admin/Employee can update orders
CREATE POLICY "Staff can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Admin can delete orders
CREATE POLICY "Admin can delete orders" ON orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- ORDER ITEMS POLICIES
-- =============================================

-- Users can view their order items
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Staff can view all order items
CREATE POLICY "Staff can view all order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- System can insert order items
CREATE POLICY "Insert order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- =============================================
-- LOYALTY REWARDS POLICIES
-- =============================================

CREATE POLICY "Anyone can view active rewards" ON loyalty_rewards
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage rewards" ON loyalty_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- LOYALTY TRANSACTIONS POLICIES
-- =============================================

CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage loyalty transactions" ON loyalty_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- PRICE HISTORY POLICIES
-- =============================================

CREATE POLICY "Staff can view price history" ON price_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "System can insert price history" ON price_history
    FOR INSERT WITH CHECK (true);

-- =============================================
-- STOCK ALERTS POLICIES
-- =============================================

CREATE POLICY "Staff can view stock alerts" ON stock_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "Staff can update stock alerts" ON stock_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        'consumer',
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track price changes
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

CREATE TRIGGER on_product_price_change
    AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION track_price_change();

-- Function to check low stock and create alerts
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

CREATE TRIGGER on_stock_change
    AFTER UPDATE OF stock_quantity ON products
    FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- Function to generate order number
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

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Function to update loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total points
    UPDATE profiles
    SET loyalty_points = loyalty_points + NEW.points
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_loyalty_transaction
    AFTER INSERT ON loyalty_transactions
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_points();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets for all image types
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('banners', 'banners', true),
  ('logos', 'logos', true),
  ('rewards-images', 'rewards-images', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- STORAGE POLICIES - PUBLIC READ ACCESS
-- =============================================

-- Anyone can view all public images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Public can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Public can view banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Public can view rewards images"
ON storage.objects FOR SELECT
USING (bucket_id = 'rewards-images');

-- =============================================
-- STORAGE POLICIES - ADMIN UPLOAD ACCESS
-- =============================================

-- Admin can upload to all buckets
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'category-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'logos' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can upload rewards images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'rewards-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =============================================
-- STORAGE POLICIES - ADMIN DELETE ACCESS
-- =============================================

-- Admin can delete from all buckets
CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can delete category images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'category-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can delete banners"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'banners' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can delete logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'logos' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can delete rewards images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'rewards-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =============================================
-- STORAGE POLICIES - ADMIN UPDATE ACCESS
-- =============================================

-- Admin can update files in all buckets
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can update category images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'category-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can update banners"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'banners' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can update logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'logos' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can update rewards images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'rewards-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);