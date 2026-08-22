-- Supabase schema for Sthanam
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Optional; there are no user accounts yet, but orders reference it.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  amount INTEGER,
  currency TEXT DEFAULT 'INR',
  email TEXT,
  tier TEXT,
  city TEXT,
  theme TEXT,
  width INTEGER,
  height INTEGER,
  multiplier INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- For databases created before the tier column existed.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tier TEXT;

CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The backend talks to Supabase with the service_role key, which bypasses RLS
-- entirely. So the correct posture for these tables is: RLS on, and no policy
-- granting anything to `anon` or `authenticated`.
--
-- This matters. The anon key is public — it ships to every browser. An earlier
-- version of this file created `FOR ALL USING (true)` on download_tokens with
-- no TO clause, which applies to every role: anyone could have listed every
-- download token, redeemed them, or reset `used` back to false. The DROPs below
-- remove those policies from databases that already ran it.
-- ---------------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to tokens" ON download_tokens;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Revoke the default grants Supabase hands the public roles, so a leaked anon
-- key cannot even attempt a query against these tables.
REVOKE ALL ON users FROM anon, authenticated;
REVOKE ALL ON orders FROM anon, authenticated;
REVOKE ALL ON download_tokens FROM anon, authenticated;

-- When user accounts arrive, add read-only policies here, e.g.
--   CREATE POLICY "Users read own orders" ON orders
--     FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Never add a policy on download_tokens: they are redeemed server-side only.

-- ---------------------------------------------------------------------------
-- Housekeeping
-- ---------------------------------------------------------------------------

-- Expired tokens serve no purpose and are the only table that grows unbounded.
-- Run manually, or schedule with pg_cron if the extension is enabled.
--   DELETE FROM download_tokens WHERE expires_at < NOW() - INTERVAL '7 days';
