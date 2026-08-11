import { query } from "./db"

/**
 * Compatible Neon-SQL template adapter.
 * Adapts pg Pool connection to support standard sql`query` template queries
 * and legacy sql.query(...) calls across the entire codebase.
 */
export const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: any[]) => {
    let queryText = ""
    for (let i = 0; i < strings.length; i++) {
      queryText += strings[i]
      if (i < values.length) {
        queryText += `$${i + 1}`
      }
    }
    return query(queryText, values)
  },
  {
    query: async (text: string, params: any[] = []) => {
      return query(text, params)
    },
    unsafe: async (text: string, params: any[] = []) => {
      return query(text, params)
    }
  }
)

// Re-export types for backward compatibility
export type { MenuItem, Category, Order, Reservation, Variant, CartItem, CartState } from './types'
