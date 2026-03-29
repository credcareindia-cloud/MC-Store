-- Admin panel users (login: /api/admin/auth/login, table used by bcrypt verify)
-- Run once against your Postgres database, e.g.:
--   psql "$DATABASE_URL" -f scripts/018-admin-users.sql
-- Or paste into Neon / Supabase SQL editor.

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial super admin (password: 1234 — change immediately in production)
-- Bcrypt hash generated with bcryptjs, cost 10
-- Dollar-quoted strings avoid smart-quote paste issues and $ in bcrypt confusing some clients.
INSERT INTO admin_users (email, password, name, role, is_verified)
VALUES (
  $m$ecommotoclub@gmail.com$m$,
  $p$$2b$10$zEbaagkyvnKUD4XczhG7.OG6j3nYFhm.If9ZPh4FeGGiv8gg2ORNe$p$,
  $n$Admin$n$,
  $r$super_admin$r$,
  true
)
ON CONFLICT (email) DO NOTHING;
