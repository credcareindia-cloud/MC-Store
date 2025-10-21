import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  theme: "light" | "dark"
  sidebarOpen: boolean
  loading: boolean
  notifications: Array<{
    id: string
    type: "success" | "error" | "info" | "warning"
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  theme: "light",
  sidebarOpen: false,
  loading: false,
  notifications: [],
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<UIState["notifications"][0], "id" | "timestamp">>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
  },
})

export const { toggleTheme, toggleSidebar, setLoading, addNotification, removeNotification } = uiSlice.actions
export default uiSlice.reducer
