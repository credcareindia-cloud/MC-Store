import { configureStore } from "@reduxjs/toolkit"
import productReducer from "./slices/productSlice"
import orderReducer from "./slices/orderSlice"
import uiReducer from "./slices/uiSlice"
import wishlistReducer from './slices/wishlistSlice'

export const store = configureStore({
  reducer: {
    products: productReducer,
    order: orderReducer,
    ui: uiReducer,
    wishlist: wishlistReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
