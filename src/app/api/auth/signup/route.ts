import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, storeName, shopDomain, apiKey, apiSecret } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !storeName || !shopDomain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if shop domain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { shopDomain }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Store with this domain already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: storeName,
          shopDomain,
          apiKey: apiKey || null,
          apiSecret: apiSecret || null,
          isActive: true,
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          role: 'admin', // First user is admin
          tenantId: tenant.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      })

      return { tenant, user }
    })

    return NextResponse.json({
      success: true,
      user: result.user,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        shopDomain: result.tenant.shopDomain,
      }
    })

  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
