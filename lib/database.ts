import { neon } from "@neondatabase/serverless"

/**
 * Neon SQL client – singleton.
 * Falls back to the provided connection string when `DATABASE_URL`
 * isn't defined in the environment (useful for next-lite preview).
 */

const connectionString =
  process.env.DATABASE_URL ??
  ""

export const sql = neon(connectionString)

// Re-export types for backward compatibility
export type { MenuItem, Category, Order, Reservation, Variant, CartItem, CartState } from './types'
