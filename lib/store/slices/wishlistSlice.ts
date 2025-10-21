import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface WishlistItem {
  id: number
  name: string
  price: number
  price_aed?: number  
  price_inr?: number 
  default_currency?: string 
  image_url: string
  category_id?: number
  category_name?: string
  description?: string
  brand?: string
  is_available: boolean
  shop_category?: string
  features?: string[]
}

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  error: string | null
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null
}

export const fetchWishlistFromAPI = createAsyncThunk(
  'wishlist/fetchFromAPI',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching wishlist from API...')
      const response = await fetch('/api/wishlist', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('unauthorized - user not logged in')
          return []
        }
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Fetch wishlist failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch wishlist')
    }
  }
)

export const addToWishlistAPI = createAsyncThunk(
  'wishlist/addToAPI',
  async (product: WishlistItem, { rejectWithValue }) => {
    try {
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      return product
    } catch (error) {
      console.error('Add to wishlist failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to wishlist')
    }
  }
)

export const removeFromWishlistAPI = createAsyncThunk(
  'wishlist/removeFromAPI',
  async (productId: number, { rejectWithValue }) => {
    try {
      
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      return productId
    } catch (error) {
      console.error(error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from wishlist')
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = []
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistFromAPI.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlistFromAPI.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchWishlistFromAPI.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Add to wishlist
    builder
      .addCase(addToWishlistAPI.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToWishlistAPI.fulfilled, (state, action) => {
        state.loading = false
        const existingItem = state.items.find(item => item.id === action.payload.id)
        if (!existingItem) {
          state.items.push(action.payload)
        }
        state.error = null
      })
      .addCase(addToWishlistAPI.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Remove from wishlist
    builder
      .addCase(removeFromWishlistAPI.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromWishlistAPI.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        state.error = null
      })
      .addCase(removeFromWishlistAPI.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearWishlist } = wishlistSlice.actions
export const addToWishlist = addToWishlistAPI
export const removeFromWishlist = removeFromWishlistAPI
export default wishlistSlice.reducer
