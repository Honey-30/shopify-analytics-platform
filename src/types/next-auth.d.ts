import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    tenantId: number
    role: string
    tenant?: {
      id: number
      name: string
      shopDomain: string
    }
  }

  interface Session {
    user: {
      id: number
      email: string
      firstName?: string | null
      lastName?: string | null
      name?: string | null
      tenantId: number
      role: string
      tenant?: {
        id: number
        name: string
        shopDomain: string
      }
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    firstName?: string | null
    lastName?: string | null
    tenantId: number
    role: string
    tenant?: {
      id: number
      name: string
      shopDomain: string
    }
  }
}