import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth0.getSession(req)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        include: {
          subscription: true,
          usage: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })
    } catch (error: any) {
      // Handle unique constraint error on email
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        console.log('Email conflict detected, trying to find existing user by email')
        // Try to find existing user by email and update auth0Id
        const existingUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            subscription: true,
            usage: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
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
            include: {
              subscription: true,
              usage: {
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
            },
          })
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        subscription: user.subscription ? {
          ...user.subscription,
          stripeCustomerId: user.subscription.stripeCustomerId,
        } : null,
        recentUsage: user.usage?.map(usage => ({
          id: usage.id,
          type: usage.type,
          amount: usage.amount,
          description: usage.description,
          createdAt: usage.createdAt.toISOString(),
        })) ?? [],
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
