import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

export interface AuthUser {
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

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          shopDomain: true,
          isActive: true,
        }
      }
    }
  })

  if (!user || !user.tenant.isActive) {
    return null
  }

  const isValid = await compare(password, user.password)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    tenantId: user.tenantId,
    role: user.role,
    tenant: user.tenant,
  }
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          shopDomain: true,
          isActive: true,
        }
      }
    }
  })

  if (!user || !user.tenant.isActive) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    tenantId: user.tenantId,
    role: user.role,
    tenant: user.tenant,
  }
}
