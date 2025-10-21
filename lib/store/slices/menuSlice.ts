import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { MenuItem, Category } from "@/lib/database"

interface MenuState {
  items: MenuItem[]
  categories: Category[]
  featuredItems: MenuItem[]
  loading: boolean
  error: string | null
  selectedCategory: number | null
}

const initialState: MenuState = {
  items: [],
  categories: [],
  featuredItems: [],
  loading: false,
  error: null,
  selectedCategory: null,
}

export const fetchMenuItems = createAsyncThunk("menu/fetchItems", async () => {
  const response = await fetch("/api/menu")
  if (!response.ok) throw new Error("Failed to fetch menu items")
  return response.json()
})

export const fetchCategories = createAsyncThunk("menu/fetchCategories", async () => {
  const response = await fetch("/api/categories")
  if (!response.ok) throw new Error("Failed to fetch categories")
  return response.json()
})

const menuSlice = createSlice({
  name: "menu",
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
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.featuredItems = action.payload.items.filter((item: MenuItem) => item.is_featured)
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch menu items"
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
  },
})

export const { setSelectedCategory, clearError } = menuSlice.actions
export default menuSlice.reducer
