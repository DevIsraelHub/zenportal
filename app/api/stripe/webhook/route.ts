import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

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

function mapStripeStatusToPrisma(status: string): "ACTIVE" | "INACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" {
  switch (status.toLowerCase()) {
    case "active":
      return "ACTIVE"
    case "trialing":
      return "TRIALING"
    case "past_due":
      return "PAST_DUE"
    case "canceled":
    case "cancelled":
      return "CANCELED"
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
    default:
      return "INACTIVE"
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature")
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
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
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string | undefined
        const customerId = session.customer as string | undefined
        const auth0Id = session.metadata?.auth0Id

        console.log("Checkout session completed:", {
          sessionId: session.id,
          customerId,
          subscriptionId,
          auth0Id,
          metadata: session.metadata
        })

        if (!auth0Id) {
          console.error("No auth0Id found in session metadata")
          break
        }

        if (!customerId) {
          console.error("No customerId found in session")
          break
        }

        // Find user by auth0Id
        const user = await prisma.user.findUnique({ where: { auth0Id } })
        if (!user) {
          console.error("User not found for auth0Id:", auth0Id)
          break
        }

        // Determine plan via the first line item if available
        let priceId: string | undefined
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
          priceId = lineItems.data[0]?.price?.id || undefined
        } catch (error) {
          console.error("Error fetching line items:", error)
        }
        const plan = planFromPriceId(priceId)

        console.log("Creating/updating subscription for user:", user.id, "with customerId:", customerId)

        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: "ACTIVE",
            plan,
            currentPeriodStart: session.created ? new Date(session.created * 1000) : undefined,
          },
          create: {
            userId: user.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: "ACTIVE",
            plan,
            currentPeriodStart: session.created ? new Date(session.created * 1000) : undefined,
          },
        })

        console.log("Subscription created/updated successfully")
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id
        const plan = planFromPriceId(priceId)
        const status = mapStripeStatusToPrisma(subscription.status)

        console.log("Subscription created/updated:", {
          subscriptionId: subscription.id,
          customerId,
          priceId,
          plan,
          status: subscription.status
        })

        // Find user by customer ID - try multiple approaches
        let user = await prisma.user.findFirst({
          where: { subscription: { stripeCustomerId: customerId } },
          include: { subscription: true }
        })

        // If not found by subscription, try to find by email in Stripe customer
        if (!user) {
          try {
            const stripeCustomer = await stripe.customers.retrieve(customerId)
            if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
              user = await prisma.user.findUnique({
                where: { email: stripeCustomer.email },
                include: { subscription: true }
              })
              console.log("Found user by email from Stripe customer:", user?.id)
            }
          } catch (error) {
            console.error("Error fetching Stripe customer:", error)
          }
        }

        if (!user) {
          console.error("User not found for customerId:", customerId)
          break
        }

        // If this is a new subscription and user already has an active subscription,
        // cancel the old one to prevent multiple active subscriptions
        if (subscription.status === 'active' && user.subscription?.status === 'ACTIVE') {
          console.log("User already has active subscription, canceling old one")
          try {
            if (user.subscription.stripeSubscriptionId) {
              await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId)
              console.log("Canceled old subscription:", user.subscription.stripeSubscriptionId)
            }
          } catch (error) {
            console.error("Error canceling old subscription:", error)
          }
        }

        // Use upsert to handle cases where subscription doesn't exist yet
        // If user already has a subscription, update it with the new one
        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            status,
            plan,
            currentPeriodStart: (subscription as any).current_period_start
              ? new Date((subscription as any).current_period_start * 1000)
              : undefined,
            currentPeriodEnd: (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : undefined,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
          },
          create: {
            userId: user.id,
            status,
            plan,
            currentPeriodStart: (subscription as any).current_period_start
              ? new Date((subscription as any).current_period_start * 1000)
              : undefined,
            currentPeriodEnd: (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : undefined,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
          },
        })

        console.log("Subscription upserted successfully for user:", user.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log("Subscription deleted:", {
          subscriptionId: subscription.id,
          customerId
        })

        const user = await prisma.user.findFirst({
          where: { subscription: { stripeCustomerId: customerId } },
          include: { subscription: true }
        })

        if (!user) {
          console.error("User not found for customerId:", customerId)
          break
        }

        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: "CANCELED",
            stripeSubscriptionId: null,
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string | undefined

        if (subscriptionId) {
          console.log("Invoice payment succeeded for subscription:", subscriptionId)

          const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId }
          })

          if (subscription) {
            await prisma.subscription.update({
              where: { stripeSubscriptionId: subscriptionId },
              data: { status: "ACTIVE" },
            })
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string | undefined

        if (subscriptionId) {
          console.log("Invoice payment failed for subscription:", subscriptionId)

          const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId }
          })

          if (subscription) {
            await prisma.subscription.update({
              where: { stripeSubscriptionId: subscriptionId },
              data: { status: "PAST_DUE" },
            })
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handling error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

