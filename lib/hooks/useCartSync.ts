import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/lib/contexts/auth-context'
import { useCurrency } from '@/lib/contexts/currency-context'
import { fetchCartFromAPI, clearCart, saveCartToAPI } from '@/lib/store/slices/orderSlice'
import type { AppDispatch, RootState } from '@/lib/store'
import { useSelector } from 'react-redux'

export const useCartSync = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, loading } = useAuth()
  const { selectedCurrency } = useCurrency()
  const { cart } = useSelector((state: RootState) => state.order)

  useEffect(() => {
    
    if (!loading) {
      if (isAuthenticated && user?.id) {
        dispatch(fetchCartFromAPI({ userId: user.id.toString(), selectedCurrency }))
      } else {
        dispatch(clearCart())
      }
    }
  }, [isAuthenticated, user?.id, loading, selectedCurrency, dispatch])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    if (isAuthenticated && user?.id && cart.length > 0) {
      timeoutId = setTimeout(() => {
        dispatch(saveCartToAPI({ 
          userId: user.id.toString(), 
          cart, 
          selectedCurrency 
        }))
      }, 1000) 
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [cart, isAuthenticated, user?.id, selectedCurrency, dispatch])
}
