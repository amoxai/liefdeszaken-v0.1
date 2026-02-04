-- =============================================
-- LIEFDESZAKEN SEED DATA
-- Run this after schema.sql to add sample data
-- =============================================

-- NOTE: Product images should be uploaded to Supabase Storage
-- The URLs below use the Supabase storage URL format:
-- {SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}
-- 
-- For now, we use placeholder images from Unsplash.
-- In production, upload images to Storage and update these URLs.

-- Insert sample categories with storage-ready image paths
INSERT INTO categories (id, name, slug, description, image_url, is_active, position) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Romantische Cadeaus', 'romantische-cadeaus', 'Prachtige romantische cadeaus voor je geliefde', 'categories/romantische-cadeaus.jpg', true, 1),
  ('a2222222-2222-2222-2222-222222222222', 'Valentijn', 'valentijn', 'Speciale Valentijnsdag collectie', 'categories/valentijn.jpg', true, 2),
  ('a3333333-3333-3333-3333-333333333333', 'Sieraden', 'sieraden', 'Mooie sieraden voor elke gelegenheid', 'categories/sieraden.jpg', true, 3),
  ('a4444444-4444-4444-4444-444444444444', 'Bloemen & Planten', 'bloemen-planten', 'Verse bloemen en planten', 'categories/bloemen-planten.jpg', true, 4),
  ('a5555555-5555-5555-5555-555555555555', 'Chocolade & Snoep', 'chocolade-snoep', 'Heerlijke zoetigheden', 'categories/chocolade-snoep.jpg', true, 5);

-- Insert sample products
INSERT INTO products (id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, category_id, is_active, is_featured) VALUES
  ('b1111111-1111-1111-1111-111111111111', 
   'Hartvormige Ketting', 
   'hartvormige-ketting', 
   'Een prachtige hartvormige ketting gemaakt van sterling zilver. Perfect als cadeau voor je geliefde op speciale momenten.',
   'Sterling zilveren hartvormige ketting',
   49.99, 59.99, 'JEW-001', 50, 'a3333333-3333-3333-3333-333333333333', true, true),

  ('b2222222-2222-2222-2222-222222222222', 
   'Romantisch Rozenboeket', 
   'romantisch-rozenboeket', 
   'Een prachtig boeket van 12 rode rozen, symbool van liefde en passie. Inclusief elegant inpakpapier en een persoonlijke kaart.',
   'Boeket van 12 rode rozen',
   34.99, NULL, 'FLO-001', 25, 'a4444444-4444-4444-4444-444444444444', true, true),

  ('b3333333-3333-3333-3333-333333333333', 
   'Luxe Chocolade Hartjes', 
   'luxe-chocolade-hartjes', 
   'Handgemaakte Belgische chocolade hartjes in een elegante geschenkdoos. Bevat 20 stuks in diverse smaken.',
   'Belgische chocolade hartjes - 20 stuks',
   24.99, 29.99, 'CHO-001', 100, 'a5555555-5555-5555-5555-555555555555', true, true),

  ('b4444444-4444-4444-4444-444444444444', 
   'Valentijns Cadeau Set', 
   'valentijns-cadeau-set', 
   'Complete Valentijns cadeau set inclusief chocolade, een knuffelbeertje en een persoonlijk kaartje. De perfecte verrassing!',
   'Complete Valentijns cadeau set',
   59.99, 79.99, 'VAL-001', 30, 'a2222222-2222-2222-2222-222222222222', true, true),

  ('b5555555-5555-5555-5555-555555555555', 
   'Gepersonaliseerde Armband', 
   'gepersonaliseerde-armband', 
   'Elegante armband met de mogelijkheid om een naam of datum te graveren. Gemaakt van roestvrij staal met gouden afwerking.',
   'Gepersonaliseerde armband met gravering',
   39.99, NULL, 'JEW-002', 40, 'a3333333-3333-3333-3333-333333333333', true, false),

  ('b6666666-6666-6666-6666-666666666666', 
   'Romantisch Fotoalbum', 
   'romantisch-fotoalbum', 
   'Luxe fotoalbum met ruimte voor 100 fotos. Voorzien van een mooie omslag met Love tekst en hartjes.',
   'Luxe fotoalbum - 100 fotos',
   29.99, 34.99, 'ROM-001', 60, 'a1111111-1111-1111-1111-111111111111', true, false),

  ('b7777777-7777-7777-7777-777777777777', 
   'Eeuwige Roos in Glas', 
   'eeuwige-roos-in-glas', 
   'Geconserveerde roos in een glazen stolp die jarenlang mooi blijft. Inclusief LED verlichting voor een magisch effect.',
   'Geconserveerde roos met LED',
   44.99, 54.99, 'FLO-002', 35, 'a4444444-4444-4444-4444-444444444444', true, true),

  ('b8888888-8888-8888-8888-888888888888', 
   'Love Letters Set', 
   'love-letters-set', 
   'Set van 12 voorgedrukte liefdesbrieven in een houten kistje. Open elke maand een nieuwe brief vol romantiek.',
   '12 romantische brieven',
   27.99, NULL, 'ROM-002', 45, 'a1111111-1111-1111-1111-111111111111', true, false),

  ('b9999999-9999-9999-9999-999999999999', 
   'Chocolade Fondue Set', 
   'chocolade-fondue-set', 
   'Complete chocolade fondue set voor een romantisch avondje. Inclusief 500g Belgische chocolade en fruit spiesjes.',
   'Fondue set met chocolade',
   42.99, 49.99, 'CHO-002', 25, 'a5555555-5555-5555-5555-555555555555', true, false),

  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
   'Hartjes Oorbellen', 
   'hartjes-oorbellen', 
   'Delicate hartjes oorbellen van sterling zilver met zirkonia steentjes. Hypoallergeen en geschikt voor gevoelige oren.',
   'Sterling zilver met zirkonia',
   32.99, 39.99, 'JEW-003', 55, 'a3333333-3333-3333-3333-333333333333', true, false),

  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
   'Luxe Giftbox - Romantiek', 
   'luxe-giftbox-romantiek', 
   'Premium giftbox met chocolade truffels, rozenblaadjes zeep, geurkaarsen en een zijden oogmasker. Luxe verpakt.',
   'Premium romantische giftbox',
   79.99, 99.99, 'ROM-003', 20, 'a1111111-1111-1111-1111-111111111111', true, true),

  ('bccccccc-cccc-cccc-cccc-cccccccccccc', 
   'Gemengd Seizoensboeket', 
   'gemengd-seizoensboeket', 
   'Prachtig gemengd boeket met seizoensbloemen in romantische kleuren. Elke week een andere samenstelling.',
   'Seizoensbloemen mix',
   28.99, NULL, 'FLO-003', 30, 'a4444444-4444-4444-4444-444444444444', true, false);

-- Insert sample product images (storage paths - upload actual images to Supabase Storage)
-- URL format: {SUPABASE_URL}/storage/v1/object/public/product-images/{path}
INSERT INTO product_images (product_id, url, alt_text, position) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'products/hartvormige-ketting.jpg', 'Hartvormige ketting', 0),
  ('b2222222-2222-2222-2222-222222222222', 'products/rozenboeket.jpg', 'Rozenboeket', 0),
  ('b3333333-3333-3333-3333-333333333333', 'products/chocolade-hartjes.jpg', 'Chocolade hartjes', 0),
  ('b4444444-4444-4444-4444-444444444444', 'products/valentijns-cadeau-set.jpg', 'Valentijns cadeau set', 0),
  ('b5555555-5555-5555-5555-555555555555', 'products/gepersonaliseerde-armband.jpg', 'Gepersonaliseerde armband', 0),
  ('b6666666-6666-6666-6666-666666666666', 'products/romantisch-fotoalbum.jpg', 'Romantisch fotoalbum', 0),
  ('b7777777-7777-7777-7777-777777777777', 'products/eeuwige-roos-in-glas.jpg', 'Eeuwige roos in glas', 0),
  ('b8888888-8888-8888-8888-888888888888', 'products/love-letters-set.jpg', 'Love letters set', 0),
  ('b9999999-9999-9999-9999-999999999999', 'products/chocolade-fondue-set.jpg', 'Chocolade fondue set', 0),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'products/hartjes-oorbellen.jpg', 'Hartjes oorbellen', 0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'products/luxe-giftbox.jpg', 'Luxe giftbox', 0),
  ('bccccccc-cccc-cccc-cccc-cccccccccccc', 'products/gemengd-seizoensboeket.jpg', 'Gemengd seizoensboeket', 0);

-- Insert sample loyalty rewards with storage image paths
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, reward_value, image_url, is_active) VALUES
  ('5% Korting', 'Ontvang 5% korting op je volgende bestelling', 100, 'percentage', 5.00, 'rewards/5-percent.jpg', true),
  ('10% Korting', 'Ontvang 10% korting op je volgende bestelling', 200, 'percentage', 10.00, 'rewards/10-percent.jpg', true),
  ('Gratis Verzending', 'Gratis verzending op je volgende bestelling', 150, 'free_shipping', 0.00, 'rewards/free-shipping.jpg', true),
  ('€5 Korting', 'Ontvang €5 korting op je volgende bestelling', 75, 'discount', 5.00, 'rewards/5-euro.jpg', true),
  ('€10 Korting', 'Ontvang €10 korting op je volgende bestelling', 150, 'discount', 10.00, 'rewards/10-euro.jpg', true);

-- =============================================
-- SAMPLE BANNERS (for homepage)
-- Upload to: banners bucket
-- =============================================
-- banner-hero.jpg - Main hero banner
-- banner-valentijn.jpg - Valentijn promotion
-- banner-sale.jpg - Sale announcement

-- =============================================
-- LOGO FILES
-- Upload to: logos bucket  
-- =============================================
-- logo.png - Main logo
-- logo-white.png - White version for dark backgrounds
-- favicon.ico - Browser favicon
