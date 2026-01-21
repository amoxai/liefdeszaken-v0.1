// User Roles
export type UserRole = 'admin' | 'employee' | 'b2b' | 'consumer' | 'guest';

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  vat_number?: string;
  vat_validated?: boolean;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

// Address
export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  created_at: string;
}

// Product Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  sku: string;
  barcode?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  category_id?: string;
  category?: Category;
  images: ProductImage[];
  is_active: boolean;
  is_featured: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

// Product Image
export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  position: number;
  created_at: string;
}

// B2B Price List
export interface B2BPriceList {
  id: string;
  name: string;
  discount_percentage: number;
  created_at: string;
}

// B2B Customer Price
export interface B2BCustomerPrice {
  id: string;
  user_id: string;
  product_id: string;
  custom_price?: number;
  discount_percentage?: number;
}

// Cart Item
export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
}

// Cart
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  loyalty_points_earned: number;
}

// Order Status
export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Payment Status
export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// Order
export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  user?: UserProfile;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  shipping_address: Address;
  billing_address: Address;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  loyalty_points_earned: number;
  loyalty_points_used: number;
  notes?: string;
  tracking_number?: string;
  is_b2b: boolean;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
}

// Order Item
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

// Loyalty Reward
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  reward_type: 'discount' | 'free_shipping' | 'free_product' | 'percentage';
  reward_value: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

// Loyalty Transaction
export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id?: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  created_at: string;
}

// Price History
export interface PriceHistory {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  changed_by: string;
  created_at: string;
}

// Stock Alert
export interface StockAlert {
  id: string;
  product_id: string;
  product: Product;
  current_stock: number;
  threshold: number;
  is_acknowledged: boolean;
  created_at: string;
}

// Filter Options
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest';
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
