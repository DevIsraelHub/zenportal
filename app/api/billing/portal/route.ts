import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { auth0 } from "@/lib/auth0"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await auth0.getSession(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 })
    }

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

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/billing`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (err) {
    console.error("Billing portal error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


