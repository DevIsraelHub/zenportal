import { prisma } from "./prisma"

export type SubscriptionLevel = "FREE" | "STARTER" | "CORE" | "ADVANCED" | "MAX"

export interface SubscriptionInfo {
  level: SubscriptionLevel
  status: "ACTIVE" | "INACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING"
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

/**
 * Get the current subscription level for a user
 */
export async function getUserSubscriptionLevel(userId: string): Promise<SubscriptionLevel> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription || subscription.status !== "ACTIVE") {
    return "FREE"
  }

  return subscription.plan as SubscriptionLevel
}

/**
 * Get detailed subscription information for a user
 */
export async function getUserSubscriptionInfo(userId: string): Promise<SubscriptionInfo | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return null
  }

  return {
    level: subscription.plan as SubscriptionLevel,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart ?? undefined,
    currentPeriodEnd: subscription.currentPeriodEnd ?? undefined,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeCustomerId: subscription.stripeCustomerId ?? undefined,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? undefined,
  }
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  return subscription?.status === "ACTIVE" || subscription?.status === "TRIALING"
}

/**
 * Check if a user has access to a specific feature based on their subscription level
 */
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const level = await getUserSubscriptionLevel(userId)

  const featureAccess = {
    FREE: ["basic_dashboard"],
    STARTER: ["basic_dashboard", "premium_llm_calls", "slow_mode"],
    CORE: ["basic_dashboard", "premium_llm_calls", "slow_mode", "multi_repo", "analytics", "sso"],
    ADVANCED: ["basic_dashboard", "premium_llm_calls", "slow_mode", "multi_repo", "analytics", "sso", "claude_opus"],
    MAX: ["basic_dashboard", "premium_llm_calls", "slow_mode", "multi_repo", "analytics", "sso", "claude_opus", "high_limits"],
  }

  return featureAccess[level]?.includes(feature) || false
}

/**
 * Get subscription limits for a user
 */
export async function getSubscriptionLimits(userId: string) {
  const level = await getUserSubscriptionLevel(userId)

  const limits = {
    FREE: {
      dailyLLMCalls: 25,
      slowModeCalls: 0,
      repositories: 1,
      teamMembers: 1,
    },
    STARTER: {
      dailyLLMCalls: 200,
      slowModeCalls: -1, // unlimited
      repositories: 3,
      teamMembers: 1,
    },
    CORE: {
      dailyLLMCalls: 550,
      slowModeCalls: -1, // unlimited
      repositories: 10,
      teamMembers: 5,
    },
    ADVANCED: {
      dailyLLMCalls: 1500,
      slowModeCalls: -1, // unlimited
      repositories: 25,
      teamMembers: 15,
    },
    MAX: {
      dailyLLMCalls: 3200,
      slowModeCalls: -1, // unlimited
      repositories: -1, // unlimited
      teamMembers: -1, // unlimited
    },
  }

  return limits[level]
}
