import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/lib/contexts/auth-context'
import { useCurrency } from '@/lib/contexts/currency-context'
import {
  fetchCartFromAPI,
  clearCart,
  saveCartToAPI,
  setCart,
  type CartItem,
} from '@/lib/store/slices/orderSlice'
import type { AppDispatch, RootState } from '@/lib/store'
import { useSelector } from 'react-redux'

const GUEST_CART_STORAGE_KEY = 'guest_cart'

const getGuestCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveGuestCartToStorage = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return

  if (!cart.length) {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY)
    return
  }

  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart))
}

const mergeCartItems = (apiCart: CartItem[], guestCart: CartItem[]): CartItem[] => {
  const merged = [...apiCart]

  for (const guestItem of guestCart) {
    const existing = merged.find(
      (item) =>
        item.menuItem.id === guestItem.menuItem.id &&
        (item.variant_id || 0) === (guestItem.variant_id || 0)
    )

    if (existing) {
      existing.quantity += guestItem.quantity
    } else {
      merged.push(guestItem)
    }
  }

  return merged
}

export const useCartSync = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, loading } = useAuth()
  const { selectedCurrency } = useCurrency()
  const { cart } = useSelector((state: RootState) => state.order)

  useEffect(() => {
    if (loading) return

    if (isAuthenticated && user?.id) {
      const guestCart = getGuestCartFromStorage()

      dispatch(fetchCartFromAPI({ userId: user.id.toString(), selectedCurrency }))
        .unwrap()
        .then((data) => {
          const apiCart = Array.isArray(data?.cart) ? data.cart : []

          if (!guestCart.length) return

          const mergedCart = mergeCartItems(apiCart, guestCart)
          dispatch(setCart({ cart: mergedCart, selectedCurrency }))
          dispatch(
            saveCartToAPI({
              userId: user.id.toString(),
              cart: mergedCart,
              selectedCurrency,
            })
          )

          localStorage.removeItem(GUEST_CART_STORAGE_KEY)
        })
        .catch(() => {
          // Keep current cart if fetch fails.
        })
    } else {
      const guestCart = getGuestCartFromStorage()
      if (guestCart.length) {
        dispatch(setCart({ cart: guestCart, selectedCurrency }))
      } else {
        dispatch(clearCart({}))
      }
    }
  }, [isAuthenticated, user?.id, loading, selectedCurrency, dispatch])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (loading) return

    if (isAuthenticated && user?.id && cart.length > 0) {
      timeoutId = setTimeout(() => {
        dispatch(saveCartToAPI({
          userId: user.id.toString(),
          cart,
          selectedCurrency
        }))
      }, 1000)
    } else if (!isAuthenticated) {
      saveGuestCartToStorage(cart)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [cart, isAuthenticated, user?.id, selectedCurrency, dispatch, loading])
}
