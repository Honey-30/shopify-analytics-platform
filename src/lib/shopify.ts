/**
 * Complete Shopify REST API Client
 * Handles all API interactions with Shopify stores
 */

export interface ShopifyConfig {
  shopDomain: string
  accessToken: string
  apiVersion?: string
}

export class ShopifyClient {
  private shopDomain: string
  private accessToken: string
  private apiVersion: string
  private baseUrl: string

  constructor(config: ShopifyConfig) {
    this.shopDomain = config.shopDomain
    this.accessToken = config.accessToken
    this.apiVersion = config.apiVersion || '2024-01'
    this.baseUrl = `https://${this.shopDomain}/admin/api/${this.apiVersion}`
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // ==================== PRODUCTS ====================

  async getProducts(params?: {
    limit?: number
    since_id?: string
    created_at_min?: string
    status?: 'active' | 'archived' | 'draft'
  }) {
    const query = new URLSearchParams(params as any).toString()
    const endpoint = `/products.json${query ? `?${query}` : ''}`
    
    const response = await this.request<{ products: any[] }>(endpoint)
    return response.products
  }

  async getProduct(productId: string) {
    const response = await this.request<{ product: any }>(`/products/${productId}.json`)
    return response.product
  }

  async createProduct(product: any) {
    const response = await this.request<{ product: any }>('/products.json', {
      method: 'POST',
      body: JSON.stringify({ product }),
    })
    return response.product
  }

  async updateProduct(productId: string, product: any) {
    const response = await this.request<{ product: any }>(`/products/${productId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ product }),
    })
    return response.product
  }

  async deleteProduct(productId: string) {
    await this.request(`/products/${productId}.json`, {
      method: 'DELETE',
    })
  }

  // ==================== ORDERS ====================

  async getOrders(params?: {
    limit?: number
    since_id?: string
    created_at_min?: string
    created_at_max?: string
    status?: 'open' | 'closed' | 'cancelled' | 'any'
    financial_status?: 'pending' | 'authorized' | 'paid' | 'refunded' | 'voided' | 'any'
  }) {
    const query = new URLSearchParams(params as any).toString()
    const endpoint = `/orders.json${query ? `?${query}` : ''}`
    
    const response = await this.request<{ orders: any[] }>(endpoint)
    return response.orders
  }

  async getOrder(orderId: string) {
    const response = await this.request<{ order: any }>(`/orders/${orderId}.json`)
    return response.order
  }

  async getOrdersCount(params?: {
    created_at_min?: string
    created_at_max?: string
    status?: 'open' | 'closed' | 'cancelled' | 'any'
  }) {
    const query = new URLSearchParams(params as any).toString()
    const endpoint = `/orders/count.json${query ? `?${query}` : ''}`
    
    const response = await this.request<{ count: number }>(endpoint)
    return response.count
  }

  // ==================== CUSTOMERS ====================

  async getCustomers(params?: {
    limit?: number
    since_id?: string
    created_at_min?: string
  }) {
    const query = new URLSearchParams(params as any).toString()
    const endpoint = `/customers.json${query ? `?${query}` : ''}`
    
    const response = await this.request<{ customers: any[] }>(endpoint)
    return response.customers
  }

  async getCustomer(customerId: string) {
    const response = await this.request<{ customer: any }>(`/customers/${customerId}.json`)
    return response.customer
  }

  async searchCustomers(query: string) {
    const endpoint = `/customers/search.json?query=${encodeURIComponent(query)}`
    const response = await this.request<{ customers: any[] }>(endpoint)
    return response.customers
  }

  // ==================== WEBHOOKS ====================

  async getWebhooks() {
    const response = await this.request<{ webhooks: any[] }>('/webhooks.json')
    return response.webhooks
  }

  async createWebhook(webhook: {
    topic: string
    address: string
    format?: 'json' | 'xml'
  }) {
    const response = await this.request<{ webhook: any }>('/webhooks.json', {
      method: 'POST',
      body: JSON.stringify({ webhook }),
    })
    return response.webhook
  }

  async deleteWebhook(webhookId: string) {
    await this.request(`/webhooks/${webhookId}.json`, {
      method: 'DELETE',
    })
  }

  async setupWebhooks(callbackUrl: string) {
    // Get existing webhooks
    const existingWebhooks = await this.getWebhooks()
    
    // Define required webhooks
    const requiredTopics = [
      'orders/create',
      'orders/updated',
      'products/create',
      'products/update',
      'customers/create',
      'customers/update',
    ]

    const results = []

    for (const topic of requiredTopics) {
      const existing = existingWebhooks.find(w => w.topic === topic)
      
      if (existing) {
        // Delete old webhook if URL changed
        if (existing.address !== `${callbackUrl}/${topic.replace('/', '')}`) {
          await this.deleteWebhook(existing.id)
          
          // Create new webhook
          const webhook = await this.createWebhook({
            topic,
            address: `${callbackUrl}/${topic.replace('/', '')}`,
            format: 'json',
          })
          
          results.push({ topic, status: 'updated', id: webhook.id })
        } else {
          results.push({ topic, status: 'exists', id: existing.id })
        }
      } else {
        // Create new webhook
        const webhook = await this.createWebhook({
          topic,
          address: `${callbackUrl}/${topic.replace('/', '')}`,
          format: 'json',
        })
        
        results.push({ topic, status: 'created', id: webhook.id })
      }
    }

    return results
  }

  // ==================== SHOP INFO ====================

  async getShop() {
    const response = await this.request<{ shop: any }>('/shop.json')
    return response.shop
  }

  // ==================== INVENTORY ====================

  async getInventoryLevels(inventoryItemIds: string[]) {
    const ids = inventoryItemIds.join(',')
    const response = await this.request<{ inventory_levels: any[] }>(
      `/inventory_levels.json?inventory_item_ids=${ids}`
    )
    return response.inventory_levels
  }
}

// Factory function to create Shopify client from tenant
export function createShopifyClient(tenant: {
  shopDomain: string
  accessToken: string | null
  apiKey?: string | null
}): ShopifyClient | null {
  if (!tenant.accessToken) {
    console.warn('No access token available for tenant')
    return null
  }

  return new ShopifyClient({
    shopDomain: tenant.shopDomain,
    accessToken: tenant.accessToken,
  })
}

// Helper to validate Shopify webhook signature
export function verifyShopifyWebhook(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')

  return hash === hmacHeader
}
