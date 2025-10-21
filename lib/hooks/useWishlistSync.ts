import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/lib/contexts/auth-context'
import { fetchWishlistFromAPI, clearWishlist } from '@/lib/store/slices/wishlistSlice'
import type { AppDispatch } from '@/lib/store'

export const useWishlistSync = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    
    if (!loading) {
      if (isAuthenticated && user?.id) {
        dispatch(fetchWishlistFromAPI())
      } else {
        dispatch(clearWishlist())
      }
    }
  }, [isAuthenticated, user?.id, loading, dispatch])
}
