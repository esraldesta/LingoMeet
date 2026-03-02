'use client'

import { Star, Award, Clock, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfessionalCardProps {
  id: string
  name: string
  image: string | null
  headline: string | null
  bio: string | null
  language: string
  level: string | null
  rating: number
  reviewCount: number
  pricePerMinute: number
  currency: string
}

export function ProfessionalCard({
  id,
  name,
  image,
  headline,
  bio,
  language,
  level,
  rating,
  reviewCount,
  pricePerMinute,
  currency,
}: ProfessionalCardProps) {

  const router = useRouter()
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
      <div className="flex gap-4">


        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className='flex items-center justify-between'>
            {/* Avatar */}
            <div className="shrink-0">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center text-white font-semibold text-lg">
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground truncate">
                    {name}
                  </h3>
                  {headline && (
                    <p className="text-sm text-muted-foreground truncate">
                      {headline}
                    </p>
                  )}
                </div>

              </div>
            </div>
            <div className='flex flex-col items-end gap-2'>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary whitespace-nowrap shrink-0">
                <Languages className="h-3 w-3" />

                {language}
              </span>
              {level && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary whitespace-nowrap shrink-0">
                  <Award className="h-3 w-3" />
                  {level}
                </span>
              )}

              {/* Rating */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-4">

                  {rating > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.round(rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({reviewCount})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Bio */}
          <div className='mt-5'>
            {bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {bio}
              </p>
            )}
          </div>



          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold text-foreground">
                ${parseFloat(pricePerMinute.toString()).toFixed(2)}
              </span>
              {/* <span className="text-sm text-muted-foreground">
                /{currency.toLowerCase()}
              </span> */}
            </div>
            <Button
              size="sm"
              className="font-medium"
              asChild
            >
              <Link href={`/professionals/${id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
