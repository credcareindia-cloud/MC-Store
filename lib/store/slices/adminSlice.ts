import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Order, MenuItem, Reservation } from "@/lib/database"

interface AdminState {
  orders: Order[]
  menuItems: MenuItem[]
  reservations: Reservation[]
  stats: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    todayReservations: number
  }
  loading: boolean
  error: string | null
}

const initialState: AdminState = {
  orders: [],
  menuItems: [],
  reservations: [],
  stats: {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayReservations: 0,
  },
  loading: false,
  error: null,
}

export const fetchAdminData = createAsyncThunk("admin/fetchData", async () => {
  const [ordersRes, menuRes, reservationsRes, statsRes] = await Promise.all([
    fetch("/api/admin/orders"),
    fetch("/api/admin/menu"),
    fetch("/api/admin/reservations"),
    fetch("/api/admin/stats"),
  ])

  const [orders, menuItems, reservations, stats] = await Promise.all([
    ordersRes.json(),
    menuRes.json(),
    reservationsRes.json(),
    statsRes.json(),
  ])

  return { orders, menuItems, reservations, stats }
})

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    updateOrderStatus: (state, action: PayloadAction<{ id: number; status: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.id)
      if (order) {
        order.status = action.payload.status as any
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.menuItems = action.payload.menuItems
        state.reservations = action.payload.reservations
        state.stats = action.payload.stats
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch admin data"
      })
  },
})

export const { updateOrderStatus } = adminSlice.actions
export default adminSlice.reducer
