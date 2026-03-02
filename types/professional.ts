import { Decimal } from '@prisma/client/runtime/client'

export interface PublicProfessionals {
  id: string
  user: {
    name: string
    image: string | null
  }
  bio: string | null
  headline: string | null
  language: string
  level: string | null
  rating: number
  reviewCount: number
  pricePerMinute: string
  currency: string
}

