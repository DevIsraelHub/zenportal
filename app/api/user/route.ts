import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth0.getSession(req)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in DB
    const user = await prisma.user.upsert({
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        subscription: user.subscription ?? null,
        recentUsage: user.usage ?? [],
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
