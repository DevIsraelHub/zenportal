import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 })
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
      customer: customerId,
      return_url: `${baseUrl}/dashboard`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (err) {
    console.error("Billing portal error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


