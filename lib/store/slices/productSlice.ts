import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface Product {
  id: number
  name: string
  description: string
  price: number // Keep original for backwards compatibility
  price_aed: number | null
  price_inr: number | null
  primary_currency: 'AED' | 'INR'
  image_url: string
  category_id: number
  category_name: string
  is_available: boolean
  is_featured: boolean
  is_new: boolean
  new_until_date: string
  features: string[]
  specifications_text: string
  warranty_months: number
  brand: string
  model: string
  condition_type: string
  warranty_period: number
  storage_capacity: string
  color: string
  stock_quantity: number
  sku: string
  shop_category: string
  created_at: string
}

interface Category {
  id: number
  name: string
  description: string
  image_url: string
  is_active: boolean
  is_special: boolean
  sort_order: number
}

interface ProductState {
  items: Product[]
  categories: Category[]
  featuredItems: Product[]
  loading: boolean
  error: string | null
  selectedCategory: number | null
  initialized: boolean,
}

const initialState: ProductState = {
  items: [],
  categories: [],
  featuredItems: [],
  loading: false,
  error: null,
  selectedCategory: null,
  initialized: false,
}

export const initializeApp = createAsyncThunk(
  "products/initialize", 
  async (_, { dispatch }) => {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      dispatch(fetchProducts()).unwrap(),
      dispatch(fetchCategories()).unwrap()
    ])

    return {
      products: productsResult.status === 'fulfilled' ? productsResult.value : null,
      categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : null,
    }
  }
)

export const fetchProducts = createAsyncThunk("products/fetchItems", async () => {
  const response = await fetch("/api/products")
  if (!response.ok) throw new Error("Failed to fetch products")
  return response.json()
})

export const fetchCategories = createAsyncThunk("products/fetchCategories", async () => {
  const response = await fetch("/api/categories")
  if (!response.ok) throw new Error("Failed to fetch categories")
  return response.json()
})

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<number | null>) => {
      state.selectedCategory = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.featuredItems = action.payload.items.filter((item: Product) => item.is_featured)
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch products"
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
       .addCase(initializeApp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        
        if (action.payload.products) {
          state.items = action.payload.products.items || []
          state.featuredItems = state.items.filter((item: Product) => item.is_featured)
        }
        
        if (action.payload.categories) {
          state.categories = action.payload.categories
        }
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.loading = false
        state.initialized = true // Still mark as initialized
        state.error = action.error.message || "Failed to initialize app"
      })
  },
})

export const { setSelectedCategory, clearError } = productSlice.actions
export default productSlice.reducer 

