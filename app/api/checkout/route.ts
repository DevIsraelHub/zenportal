import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { priceId, email } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=canceled`,
      customer_email: email,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err) {
    console.error("Checkout session error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


