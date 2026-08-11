/**
 * lib/db.ts
 *
 * Single canonical database client for MC-Store.
 * Uses node-postgres (pg) Pool so the app can connect to both
 *   • Local PostgreSQL via TCP  (DATABASE_URL = postgresql://…localhost…)
 *   • Neon cloud PostgreSQL     (DATABASE_URL = postgresql://…neon.tech…)
 *
 * All queries MUST be server-side only. Never import this in client components.
 * ERP access is READ-ONLY – no INSERT / UPDATE / DELETE on ERP tables.
 */

import { Pool, type PoolClient, type QueryResultRow } from "pg"

// ── Singleton pool ──────────────────────────────────────────────────────────
let _pool: Pool | null = null

function getPool(): Pool {
  if (_pool) return _pool

  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:admin123@localhost:5432/ecommerce_db"

  const dbName = connectionString.split("/").pop()?.split("?")[0] || "ecommerce_db"
  console.log(`\n🔌 [Database] Connection Pool Initialized for local ERP: "${dbName}"`)

  _pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    // Allow self-signed certs for local dev; Neon requires SSL
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  })

  _pool.on("error", (err) => {
    console.error("[db] Unexpected pool error:", err)
  })

  return _pool
}

let _loggedConnection = false

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query<T>(text, values)
  if (!_loggedConnection) {
    console.log("✅ [Database] Connection successful. ERP PostgreSQL single-source-of-truth is online.\n")
    _loggedConnection = true
  }
  return result.rows
}

// ── Transaction helper ──────────────────────────────────────────────────────
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

// ── Named export for raw pool access (e.g. health checks) ──────────────────
export { getPool }
export type { Pool, PoolClient }
