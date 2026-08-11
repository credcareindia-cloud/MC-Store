import { NextResponse } from "next/server";
import { sql } from "@/lib/database";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

async function getUserFromJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function GET() {
  try {
    const user = await getUserFromJWT();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await sql`
      SELECT id FROM users WHERE clerk_id = ${user.id} OR email = ${user.email} LIMIT 1
    `;

    if (userRecord.length === 0) {
      return NextResponse.json([]);
    }

    const internalUserId = userRecord[0].id;

    const coupons = await sql`
      SELECT
        c.id,
        c.code,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value_inr,
        c.discount_value_aed,
        c.minimum_purchase_inr,
        c.minimum_purchase_aed,
        c.max_purchase_inr,
        c.max_purchase_aed,
        c.user_type_restriction,
        c.valid_from,
        c.valid_to,
        c.is_active,
        u.is_redeemed,
        u.redeemed_at,
        u.assigned_at
      FROM welcome_coupons_used u
      JOIN welcome_coupons c ON c.id = u.welcome_coupon_id
      WHERE u.user_id = ${internalUserId}
      ORDER BY c.updated_at DESC, c.created_at DESC
    `;

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Failed to fetch user coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

