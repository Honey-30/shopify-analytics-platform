import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { shopDomain: 'demo-store.myshopify.com' },
    update: {},
    create: {
      name: 'Demo Store',
      shopDomain: 'demo-store.myshopify.com',
      apiKey: 'demo_api_key',
      apiSecret: 'demo_api_secret',
      isActive: true,
    },
  })

  console.log('✅ Created tenant:', tenant.name)

  // Create admin user
  const hashedPassword = await hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: hashedPassword,
      role: 'admin',
      tenantId: tenant.id,
    },
  })

  console.log('✅ Created user:', user.email)

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        shopifyCustomerId: '1001',
        email: 'sarah.johnson@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-0101',
        totalSpent: 2450.00,
        ordersCount: 8,
        city: 'New York',
        country: 'United States',
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        shopifyCustomerId: '1002',
        email: 'michael.chen@example.com',
        firstName: 'Michael',
        lastName: 'Chen',
        phone: '+1-555-0102',
        totalSpent: 1890.00,
        ordersCount: 6,
        city: 'San Francisco',
        country: 'United States',
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        shopifyCustomerId: '1003',
        email: 'emma.wilson@example.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+1-555-0103',
        totalSpent: 3200.00,
        ordersCount: 12,
        city: 'Los Angeles',
        country: 'United States',
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        shopifyCustomerId: '1004',
        email: 'james.brown@example.com',
        firstName: 'James',
        lastName: 'Brown',
        phone: '+1-555-0104',
        totalSpent: 980.00,
        ordersCount: 3,
        city: 'Chicago',
        country: 'United States',
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        shopifyCustomerId: '1005',
        email: 'olivia.davis@example.com',
        firstName: 'Olivia',
        lastName: 'Davis',
        phone: '+1-555-0105',
        totalSpent: 1560.00,
        ordersCount: 5,
        city: 'Seattle',
        country: 'United States',
      },
    }),
  ])

  console.log('✅ Created', customers.length, 'customers')

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        shopifyProductId: '2001',
        title: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        vendor: 'TechAudio',
        productType: 'Electronics',
        price: 299.99,
        compareAtPrice: 349.99,
        inventory: 45,
        sku: 'WH-1000XM4',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        shopifyProductId: '2002',
        title: 'Smart Fitness Watch',
        description: 'Track your fitness goals with advanced health monitoring',
        vendor: 'FitTech',
        productType: 'Wearables',
        price: 249.99,
        compareAtPrice: 299.99,
        inventory: 78,
        sku: 'FW-SMART-01',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        shopifyProductId: '2003',
        title: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable everyday wear',
        vendor: 'EcoWear',
        productType: 'Clothing',
        price: 34.99,
        inventory: 156,
        sku: 'TS-ORG-BLK-L',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        shopifyProductId: '2004',
        title: 'Minimalist Backpack',
        description: 'Sleek design with laptop compartment',
        vendor: 'UrbanCarry',
        productType: 'Accessories',
        price: 89.99,
        inventory: 34,
        sku: 'BP-MIN-GRY',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        status: 'active',
      },
    }),
  ])

  console.log('✅ Created', products.length, 'products')

  // Create sample orders (last 30 days)
  const orders = []
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const orderDate = new Date(today)
    orderDate.setDate(orderDate.getDate() - i)

    // 2-4 orders per day
    const ordersPerDay = Math.floor(Math.random() * 3) + 2

    for (let j = 0; j < ordersPerDay; j++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const orderTotal = Math.floor(Math.random() * 400) + 50

      orders.push(
        prisma.order.create({
          data: {
            tenantId: tenant.id,
            shopifyOrderId: `ORD-${Date.now()}-${i}-${j}`,
            orderNumber: `${1000 + orders.length}`,
            customerId: customer.id,
            customerEmail: customer.email,
            totalPrice: orderTotal,
            subtotalPrice: orderTotal * 0.9,
            totalTax: orderTotal * 0.1,
            currency: 'USD',
            financialStatus: Math.random() > 0.1 ? 'paid' : 'pending',
            fulfillmentStatus: Math.random() > 0.3 ? 'fulfilled' : 'unfulfilled',
            lineItemsCount: Math.floor(Math.random() * 3) + 1,
            orderDate: orderDate,
          },
        })
      )
    }
  }

  await Promise.all(orders)

  console.log('✅ Created', orders.length, 'orders')

  // Create cart events
  const cartEvents = await Promise.all([
    prisma.cartEvent.create({
      data: {
        tenantId: tenant.id,
        type: 'abandoned',
        cartValue: 145.99,
        customerEmail: 'potential@example.com',
        cartToken: 'cart_abc123',
      },
    }),
    prisma.cartEvent.create({
      data: {
        tenantId: tenant.id,
        type: 'converted',
        cartValue: 289.99,
        customerEmail: customers[0].email,
        cartToken: 'cart_def456',
      },
    }),
  ])

  console.log('✅ Created', cartEvents.length, 'cart events')

  console.log('🎉 Database seeded successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Email: admin@example.com')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
