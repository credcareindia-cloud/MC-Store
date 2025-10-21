import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { offerCode, orderTotal, shopId, userType, userId, cartItems, currency = 'AED' } = await request.json()

    if (!offerCode) {
      return NextResponse.json(
        { error: "Offer code is required" },
        { status: 400 }
      )
    }

    // Get currency symbol for error messages
    const currencySymbol = currency === 'AED' ? 'AED' : '₹'

    // Find the offer by parsing stored offer codes
    // Order by priority first (higher = more important), then by restrictions, then by date
    const offers = await sql`
      SELECT * FROM offers 
      WHERE is_active = true 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      ORDER BY 
        COALESCE(priority, 0) DESC,
        CASE WHEN minimum_order_value > 0 OR maximum_order_value IS NOT NULL OR 
                  usage_limit_per_user IS NOT NULL OR total_usage_limit IS NOT NULL OR 
                  shop_restriction IS NOT NULL OR user_type_restriction IS NOT NULL OR 
                  allowed_categories IS NOT NULL OR excluded_categories IS NOT NULL 
             THEN 0 ELSE 1 END,
        created_at DESC
    `

    let matchedOffer = null
    let matchedDiscount = null

    // Search through all active offers to find matching code
    for (const offer of offers) {
      try {
        const offerDiscounts = typeof offer.offers === 'string' 
          ? JSON.parse(offer.offers) 
          : offer.offers

        for (const discount of offerDiscounts) {
          // Generate the same code format as in the spinner
          const prefix = discount.type === "cash" ? "CASH" : "SPIN"
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
          const generatedCode = `${prefix}${discount.value}${randomSuffix}`
          
          // Check if the provided code matches the pattern (ignoring random suffix for validation)
          const codePattern = `${prefix}${discount.value}`
          // Use regex to match the exact pattern followed by any suffix
          const regex = new RegExp(`^${codePattern}[A-Z0-9]+$`)
          if (regex.test(offerCode)) {
            matchedOffer = offer
            matchedDiscount = discount
            break
          }
        }
        if (matchedOffer) break
      } catch (error) {
        console.error("Error parsing offer:", error)
        continue
      }
    }

    if (!matchedOffer || !matchedDiscount) {
      return NextResponse.json(
        { error: "Invalid offer code" },
        { status: 400 }
      )
    }

    // Validate offer restrictions - use currency-specific values
    const restrictions = {
      minimumOrderValue: currency === 'AED' 
        ? parseFloat(matchedOffer.minimum_order_value_aed || '0')
        : parseFloat(matchedOffer.minimum_order_value_inr || '0'),
      maximumOrderValue: currency === 'AED'
        ? (matchedOffer.maximum_order_value_aed ? parseFloat(matchedOffer.maximum_order_value_aed) : null)
        : (matchedOffer.maximum_order_value_inr ? parseFloat(matchedOffer.maximum_order_value_inr) : null),
      usageLimitPerUser: matchedOffer.usage_limit_per_user ? parseInt(matchedOffer.usage_limit_per_user) : null,
      totalUsageLimit: matchedOffer.total_usage_limit ? parseInt(matchedOffer.total_usage_limit) : null,
      shopRestriction: matchedOffer.shop_restriction,
      userTypeRestriction: matchedOffer.user_type_restriction,
      allowedCategories: matchedOffer.allowed_categories ? JSON.parse(matchedOffer.allowed_categories) : null,
      excludedCategories: matchedOffer.excluded_categories ? JSON.parse(matchedOffer.excluded_categories) : null
    }

    // 1. Check minimum order value
    if (restrictions.minimumOrderValue > 0 && orderTotal < restrictions.minimumOrderValue) {
      return NextResponse.json(
        { 
          error: `Minimum order value of ${restrictions.minimumOrderValue} ${currencySymbol} required for this offer`,
          requiredAmount: restrictions.minimumOrderValue
        },
        { status: 400 }
      )
    }

    // 2. Check maximum order value (important for 100% off protection)
    if (restrictions.maximumOrderValue && orderTotal > restrictions.maximumOrderValue) {
      return NextResponse.json(
        { 
          error: `Maximum order value of ${restrictions.maximumOrderValue} ${currencySymbol} exceeded for this offer`,
          maxAmount: restrictions.maximumOrderValue
        },
        { status: 400 }
      )
    }

    // 3. Check shop restriction (but defer to product category validation for "Both" products)
    if (restrictions.shopRestriction && shopId !== restrictions.shopRestriction) {
      // If there are allowed categories, we need to check if products are available in both shops
      // before enforcing shop restriction - defer this check to the product validation section
      if (restrictions.allowedCategories && restrictions.allowedCategories.length > 0) {
        console.log('Shop restriction exists but deferring to product category validation for cross-shop compatibility')
        // Continue to product validation - will check if categories are available in both shops
      } else {
        // No category restrictions, so enforce shop restriction strictly
        const shopName = restrictions.shopRestriction === 'A' ? 'Beauty Shop' : 'Style Shop'
        return NextResponse.json(
          { 
            error: `This offer is only valid for ${shopName}`,
            requiredShop: restrictions.shopRestriction
          },
          { status: 400 }
        )
      }
    }

    // 4. Check user type restriction
    if (restrictions.userTypeRestriction && userType !== restrictions.userTypeRestriction) {
      const requiredType = restrictions.userTypeRestriction === 'new' ? 'new customers' : 'returning customers'
      return NextResponse.json(
        { 
          error: `This offer is only valid for ${requiredType}`,
          requiredUserType: restrictions.userTypeRestriction
        },
        { status: 400 }
      )
    }

    // 5. Check usage limits
    if (userId) {
      // Check per-user usage limit
      if (restrictions.usageLimitPerUser) {
        const userUsageResult = await sql`
          SELECT COALESCE(usage_count, 0) as usage_count 
          FROM offer_usage 
          WHERE offer_id = ${matchedOffer.id} 
          AND (user_id = ${userId} OR user_email = ${userId})
        `
        const userUsageCount = userUsageResult.length > 0 ? parseInt(userUsageResult[0].usage_count) : 0
        
        if (userUsageCount >= restrictions.usageLimitPerUser) {
          return NextResponse.json(
            { 
              error: `You’ve already redeemed this offer`,
              usageLimit: restrictions.usageLimitPerUser
            },
            { status: 400 }
          )
        }
      }

      // Check total usage limit
      if (restrictions.totalUsageLimit) {
        const totalUsageResult = await sql`
          SELECT COUNT(*) as total_usage 
          FROM offer_usage 
          WHERE offer_id = ${matchedOffer.id}
        `
        const totalUsageCount = parseInt(totalUsageResult[0].total_usage)
        
        if (totalUsageCount >= restrictions.totalUsageLimit) {
          return NextResponse.json(
            { 
              error: "This offer has reached its usage limit",
              totalLimit: restrictions.totalUsageLimit
            },
            { status: 400 }
          )
        }
      }
    }

    // 6. Check product category restrictions with shop awareness
    if (cartItems && (restrictions.allowedCategories || restrictions.excludedCategories)) {
      // Get detailed product information including shop_category for validation
      const cartProductIds = cartItems.map((item: any) => item.id).filter(Boolean)
      
      if (cartProductIds.length > 0) {
        const productDetails = await sql`
          SELECT id, category_id, shop_category, name
          FROM products 
          WHERE id = ANY(${cartProductIds})
        `
        
        // Create a map for quick lookup
        const productMap = new Map()
        productDetails.forEach((product: any) => {
          productMap.set(product.id, product)
        })
        
        // Check both allowed and excluded categories with shop awareness
        for (const cartItem of cartItems) {
          const product = productMap.get(cartItem.id)
          if (!product) continue
          
          const productCategoryId = product.category_id.toString()
          const productShopCategory = product.shop_category
          
          // Check allowed categories
          if (restrictions.allowedCategories && restrictions.allowedCategories.length > 0) {
            const allowedCategoryStrings = restrictions.allowedCategories.map((cat: any) => cat.toString())
            
            if (!allowedCategoryStrings.includes(productCategoryId)) {
              return NextResponse.json(
                { 
                  error: "This offer is not valid for the products in your cart",
                  restriction: "category_not_allowed"
                },
                { status: 400 }
              )
            }
          }
          
          // Check excluded categories
          if (restrictions.excludedCategories && restrictions.excludedCategories.length > 0) {
            const excludedCategoryStrings = restrictions.excludedCategories.map((cat: any) => cat.toString())
            
            if (excludedCategoryStrings.includes(productCategoryId)) {
              return NextResponse.json(
                { 
                  error: "This offer cannot be applied to some products in your cart",
                  restriction: "category_excluded"
                },
                { status: 400 }
              )
            }
          }
          
          // If offer has shop restriction, check if we should enforce it based on product availability
          if (restrictions.shopRestriction) {
            // Key logic: If the product category is available in "Both" shops, 
            // allow the coupon to work in either shop regardless of the admin's shop restriction setting
            const isProductAvailableInBothShops = productShopCategory === 'Both'
            
            if (isProductAvailableInBothShops) {
              console.log(`Product ${product.name} (ID: ${product.id}) is available in both shops - allowing cross-shop usage despite shop restriction`)
              // Skip shop restriction enforcement for "Both" products
              continue
            }
            
            // For products only available in specific shops, enforce the restriction
            const isProductAvailableInRestrictedShop = productShopCategory === restrictions.shopRestriction
            
            if (!isProductAvailableInRestrictedShop) {
              const shopName = restrictions.shopRestriction === 'A' ? 'Beauty Shop' : 'Style Shop'
              return NextResponse.json(
                { 
                  error: `This offer is only valid for ${shopName} products. Some items in your cart are not available in ${shopName}.`,
                  restriction: "shop_product_mismatch"
                },
                { status: 400 }
              )
            }
          }
        }
      }
    }

    // Calculate discount amount
    let discountAmount = 0
    if (matchedDiscount.type === "percentage") {
      discountAmount = (orderTotal * parseFloat(matchedDiscount.value)) / 100
    } else if (matchedDiscount.type === "cash") {
      discountAmount = Math.min(parseFloat(matchedDiscount.value), orderTotal)
    }

    // Apply maximum order value limit to discount for 100% off protection
    if (restrictions.maximumOrderValue && discountAmount > restrictions.maximumOrderValue) {
      discountAmount = restrictions.maximumOrderValue
    }

    return NextResponse.json({
      valid: true,
      offer: {
        id: matchedOffer.id,
        title: matchedOffer.title,
        code: offerCode,
        type: matchedDiscount.type,
        value: matchedDiscount.value,
        discountAmount: discountAmount,
        restrictions: restrictions
      }
    })

  } catch (error) {
    console.error("Error validating offer:", error)
    return NextResponse.json(
      { error: "Failed to validate offer" },
      { status: 500 }
    )
  }
}
