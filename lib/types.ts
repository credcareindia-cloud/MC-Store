// Shared type definitions
export interface Variant {
  id: number
  name: string
  price_aed: number
  price_inr: number
  discount_aed: number
  discount_inr: number
  available_aed: boolean
  available_inr: boolean
  stock_quantity: number
}

export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  price_aed?: number | null
  price_inr?: number | null
  default_currency: 'INR' | 'AED'
  image_urls: string[]
  category_id: number
  category_name: string
  is_available: boolean
  is_featured: boolean
  is_new: boolean
  features: string[]
  specifications_text: string
  warranty_months: number
  brand?: string
  model?: string
  condition_type?: 'master' | 'first-copy' | 'second-copy' | 'hot' | 'sale' | 'none'
  shop_category: string
  storage_capacity?: string
  color?: string
  stock_quantity: number // Legacy field - now using variant-wise stock
  sku?: string
  variants: Variant[]
  // Additional fields for cart items
  variant_id?: number
  selected_variant?: Variant
}

export interface Category {
  id: number
  name: string
  sort_order?: number
}

export interface Order {
  id: number
  user_id: string
  items: any[]
  total: number
  currency: string
  status: string
  order_type: string
  customer_info: any
  payment_status: string
  payment_id?: string
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: number
  user_id: string
  name: string
  email: string
  phone: string
  party_size: number
  date: string
  time: string
  special_requests?: string
  status: string
  created_at: string
}

// Cart-specific types
export interface CartItem {
  menuItem: MenuItem
  quantity: number
  specialRequests?: string
  variant_id?: number
  selected_variant?: Variant
}

export interface CartState {
  items: CartItem[]
  total: number
  currency: string
}