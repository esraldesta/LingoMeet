'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProfessionalCard } from './_components/professional-card'
import { ProfessionalsFilter, type FilterState } from './_components/professionals-filter'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getPublicProfessionals } from '../actions/professional'
import { LanguageLevel } from '@/generated/prisma/enums'
import { PaginationInfo, PublicProfessionals } from '@/types'
import { LANGUAGES } from '@/public/constants'
import Link from 'next/link'

function ProfessionalsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [professionals, setProfessionals] = useState<PublicProfessionals[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  const filters = useMemo(() => {
    return {
      language: searchParams.get('language') || undefined,
      level: searchParams.get('level') as LanguageLevel || undefined,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      minRating: searchParams.get('minRating')
        ? Number(searchParams.get('minRating'))
        : undefined,
      page: searchParams.get('page')
        ? Number(searchParams.get('page'))
        : 1,
    }
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const result = await getPublicProfessionals({
          ...filters,
          limit: 10,
        })

        setProfessionals(result.data)
        setPagination(result.pagination)
      } catch (error) {
        console.error(error)
        setProfessionals([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams()

    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(key === 'minRating' && Number(value) === 0)
      ) {
        params.set(key, String(value))
      }
    })

    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))

    router.push(`?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card flex justify-between items-center w-full px-2">
        <div className="max-w-7xl px-4 py-2">
          <h1 className="text-3xl font-bold">Find Professionals</h1>
          <p className="text-muted-foreground">
            Browse verified professionals and book your sessions
          </p>
        </div>
        <Button asChild>
          <Link href={"/"}>
          <ArrowLeft/> Home</Link>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <ProfessionalsFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          languages={LANGUAGES}
          levels={[
            LanguageLevel.NATIVE,
            LanguageLevel.INTERMEDIATE,
            LanguageLevel.ADVANCED,
          ]}
          maxPriceLimit={500}
          isLoading={isLoading}
        />

        <div className="flex-1">
          <div className="mb-6 text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {professionals.length > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
              -
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">
              {pagination.total}
            </span>{' '}
            professionals
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : professionals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  {...professional}
                  name={professional.user.name}
                  image={professional.user.image}
                  pricePerMinute={Number(professional.pricePerMinute)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No professionals found matching your criteria.
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={
                      pageNum === pagination.page ? 'default' : 'outline'
                    }
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ProfessionalsPageFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Find Professionals</h1>
          <p className="text-muted-foreground mt-2">
            Browse verified professionals and book your sessions
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </main>
  )
}

export default function ProfessionalsPage() {
  return (
    <Suspense fallback={<ProfessionalsPageFallback />}>
      <ProfessionalsPageContent />
    </Suspense>
  )
}