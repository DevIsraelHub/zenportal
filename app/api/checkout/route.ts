import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { auth0 } from "@/lib/auth0"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    // Get the current user session
    const session = await auth0.getSession(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user exists in DB - handle email conflicts
    let user
    try {
      user = await prisma.user.upsert({
        where: { auth0Id: session.user.sub },
        update: {
          email: session.user.email ?? undefined,
          name: session.user.name ?? undefined,
          picture: (session.user as any).picture ?? undefined,
        },
        create: {
          auth0Id: session.user.sub,
          email: session.user.email || 'unknown@example.com',
          name: session.user.name ?? null,
          picture: (session.user as any).picture ?? null,
        },
        include: { subscription: true }
      })
    } catch (error: any) {
      // Handle unique constraint error on email
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        console.log('Email conflict detected, trying to find existing user by email')
        // Try to find existing user by email and update auth0Id
        const existingUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { subscription: true }
        })

        if (existingUser) {
          // Update the existing user with the new auth0Id
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              auth0Id: session.user.sub,
              name: session.user.name ?? existingUser.name,
              picture: (session.user as any).picture ?? existingUser.picture,
            },
            include: { subscription: true }
          })
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    // Determine absolute base URL
    const originHeader = req.headers.get("origin")
    const host = req.headers.get("host")
    const baseUrl =
      process.env.APP_BASE_URL ||
      process.env.AUTH0_BASE_URL ||
      originHeader ||
      (host ? `https://${host}` : undefined)

    if (!baseUrl) {
      return NextResponse.json({ error: "Unable to resolve base URL" }, { status: 500 })
    }

    // Check if user already has an active subscription
    if (user.subscription?.status === 'ACTIVE') {
      return NextResponse.json({
        error: "You already have an active subscription. Please manage your subscription in the billing portal."
      }, { status: 400 })
    }

    // Create checkout session with user metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard/billing?checkout=canceled`,
      // Use existing customer if available, otherwise use email
      ...(user.subscription?.stripeCustomerId
        ? { customer: user.subscription.stripeCustomerId }
        : { customer_email: user.email }
      ),
      metadata: {
        auth0Id: user.auth0Id,
        userId: user.id,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url })
  } catch (err) {
    console.error("Checkout session error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


