import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { prisma } from '@/lib/prisma'
import { createShopifyClient } from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Get tenant data
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Create Shopify client
    const shopifyClient = createShopifyClient(tenant)

    if (!shopifyClient) {
      return NextResponse.json(
        { error: 'Missing Shopify credentials. Please configure your API key and access token.' },
        { status: 400 }
      )
    }

    // Get the webhook callback URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const callbackUrl = `${protocol}://${host}/api/shopify/webhook`

    // Setup webhooks
    const results = await shopifyClient.setupWebhooks(callbackUrl)

    return NextResponse.json({
      success: true,
      message: 'Webhooks configured successfully',
      webhooks: results,
      callbackUrl
    })

  } catch (error: any) {
    console.error('Webhook setup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup webhooks', 
        message: error.message,
        details: error.stack 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Get tenant data
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Create Shopify client
    const shopifyClient = createShopifyClient(tenant)

    if (!shopifyClient) {
      return NextResponse.json(
        { error: 'Missing Shopify credentials' },
        { status: 400 }
      )
    }

    // Get existing webhooks
    const webhooks = await shopifyClient.getWebhooks()

    return NextResponse.json({
      success: true,
      webhooks
    })

  } catch (error: any) {
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { error: 'Failed to get webhooks', message: error.message },
      { status: 500 }
    )
  }
}
