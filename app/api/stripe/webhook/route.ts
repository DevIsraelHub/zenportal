import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function planFromPriceId(priceId?: string | null): "STARTER" | "CORE" | "ADVANCED" | "MAX" | "FREE" {
  if (!priceId) return "FREE"
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER"
  if (priceId === process.env.STRIPE_CORE_PRICE_ID) return "CORE"
  if (priceId === process.env.STRIPE_ADVANCED_PRICE_ID) return "ADVANCED"
  if (priceId === process.env.STRIPE_MAX_PRICE_ID) return "MAX"
  return "FREE"
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature")
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    console.log("Webhook received event:", event.type, event.id)
  } catch (err) {
    console.error("Webhook signature verification failed.", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const subscriptionId: string | undefined = session.subscription || undefined
        const customerId: string | undefined = session.customer || undefined
        const auth0Id: string | undefined = session.metadata?.auth0Id

        console.log("Checkout session completed:", {
          sessionId: session.id,
          customerId,
          subscriptionId,
          auth0Id,
          metadata: session.metadata
        })

        // Determine plan via the first line item if available
        let priceId: string | undefined
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
          priceId = lineItems.data[0]?.price?.id || undefined
        } catch (error) {
          console.error("Error fetching line items:", error)
        }
        const plan = planFromPriceId(priceId)

        if (!auth0Id) {
          console.error("No auth0Id found in session metadata")
          break
        }

        const user = await prisma.user.findUnique({ where: { auth0Id } })
        if (!user) {
          console.error("User not found for auth0Id:", auth0Id)
          break
        }

        console.log("Creating/updating subscription for user:", user.id, "with customerId:", customerId)

        await prisma.subscription.upsert({
          where: { stripeCustomerId: customerId! },
          update: {
            stripeCustomerId: customerId || undefined,
            stripeSubscriptionId: subscriptionId || undefined,
            status: "ACTIVE",
            plan,
            currentPeriodStart: session.created ? new Date(session.created * 1000) : undefined,
          },
          create: {
            userId: user.id,
            stripeCustomerId: customerId || "",
            stripeSubscriptionId: subscriptionId,
            status: "ACTIVE",
            plan,
            currentPeriodStart: session.created ? new Date(session.created * 1000) : undefined,
          },
        })

        console.log("Subscription created/updated successfully")
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as any
        const customerId: string = sub.customer
        const priceId: string | undefined = sub.items?.data?.[0]?.price?.id
        const plan = planFromPriceId(priceId)

        const user = await prisma.user.findFirst({ where: { subscription: { stripeCustomerId: customerId } } })
        if (!user) break

        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: (sub.status || "active").toUpperCase(),
            plan,
            currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : undefined,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
            cancelAtPeriodEnd: !!sub.cancel_at_period_end,
            stripeSubscriptionId: sub.id,
          },
        })
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any
        const customerId: string = sub.customer
        const user = await prisma.user.findFirst({ where: { subscription: { stripeCustomerId: customerId } } })
        if (!user) break
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { status: "CANCELED" },
        })
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handling error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// import { NextRequest, NextResponse } from 'next/server'
// import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
// import { prisma } from '@/lib/prisma'
// import Stripe from 'stripe'
// type PrismaSubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE' | 'STARTER' | 'CORE' | 'ADVANCED' | 'MAX'

// export async function POST(req: NextRequest) {
//   const body = await req.text()
//   const signature = req.headers.get('stripe-signature')

//   if (!signature) {
//     return NextResponse.json({ error: 'No signature' }, { status: 400 })
//   }

//   let event: Stripe.Event

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       STRIPE_CONFIG.webhookSecret
//     )
//   } catch (err) {
//     console.error('Webhook signature verification failed:', err)
//     return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
//   }

//   try {
//     switch (event.type) {
//       case 'customer.subscription.created':
//       case 'customer.subscription.updated': {
//         const subscription = event.data.object as Stripe.Subscription

//         const priceId = subscription.items.data[0]?.price.id
//         const mappedPlan: PrismaSubscriptionPlan = (() => {
//           if (priceId === STRIPE_CONFIG.prices.starter) return 'STARTER'
//           if (priceId === STRIPE_CONFIG.prices.core) return 'CORE'
//           if (priceId === STRIPE_CONFIG.prices.advanced) return 'ADVANCED'
//           if (priceId === STRIPE_CONFIG.prices.max) return 'MAX'
//           return 'FREE'
//         })()

//         const subWithPeriods = subscription as Stripe.Subscription & {
//           current_period_start: number
//           current_period_end: number
//         }

//         await prisma.subscription.upsert({
//           where: { stripeSubscriptionId: subscription.id },
//           update: {
//             status: subscription.status as 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING',
//             currentPeriodStart: new Date(subWithPeriods.current_period_start * 1000),
//             currentPeriodEnd: new Date(subWithPeriods.current_period_end * 1000),
//             cancelAtPeriodEnd: subscription.cancel_at_period_end,
//             updatedAt: new Date(),
//             plan: mappedPlan,
//           },
//           create: {
//             stripeCustomerId: subscription.customer as string,
//             stripeSubscriptionId: subscription.id,
//             status: subscription.status as 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING',
//             plan: mappedPlan,
//             currentPeriodStart: new Date(subWithPeriods.current_period_start * 1000),
//             currentPeriodEnd: new Date(subWithPeriods.current_period_end * 1000),
//             cancelAtPeriodEnd: subscription.cancel_at_period_end,
//             userId: '', // Will be updated by customer lookup
//           },
//         })
//         break
//       }

//       case 'customer.subscription.deleted': {
//         const subscription = event.data.object as Stripe.Subscription

//         await prisma.subscription.update({
//           where: { stripeSubscriptionId: subscription.id },
//           data: {
//             status: 'CANCELED',
//             updatedAt: new Date(),
//           },
//         })
//         break
//       }

//       case 'invoice.payment_succeeded': {
//         const invoice = event.data.object as Stripe.Invoice
//         const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string }

//         if (invoiceWithSub.subscription) {
//           await prisma.subscription.update({
//             where: { stripeSubscriptionId: invoiceWithSub.subscription as string },
//             data: {
//               status: 'ACTIVE',
//               updatedAt: new Date(),
//             },
//           })
//         }
//         break
//       }

//       case 'invoice.payment_failed': {
//         const invoice = event.data.object as Stripe.Invoice
//         const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string }

//         if (invoiceWithSub.subscription) {
//           await prisma.subscription.update({
//             where: { stripeSubscriptionId: invoiceWithSub.subscription as string },
//             data: {
//               status: 'PAST_DUE',
//               updatedAt: new Date(),
//             },
//           })
//         }
//         break
//       }
//     }

//     return NextResponse.json({ received: true })
//   } catch (error) {
//     console.error('Error processing webhook:', error)
//     return NextResponse.json(
//       { error: 'Webhook processing failed' },
//       { status: 500 }
//     )
//   }
// }
