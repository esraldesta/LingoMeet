'use client'

import { useCallback, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterState {
  language?: string
  level?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
}

interface LanguageOption {
  value: string
  label: string
}

interface ProfessionalsFilterProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  languages: LanguageOption[]
  levels: string[]
  maxPriceLimit?: number
  isLoading?: boolean
}

export function ProfessionalsFilter({
  filters,
  onFilterChange,
  languages,
  levels,
  maxPriceLimit = 1000,
  isLoading = false,
}: ProfessionalsFilterProps) {

  const handleUpdate = useCallback(
    (newValues: Partial<FilterState>) => {
      onFilterChange({
        ...filters,
        ...newValues,
      })
    },
    [filters, onFilterChange]
  )

  const handleClear = () => {
    onFilterChange({})
  }



  const hasActiveFilters =
    filters.language ||
    filters.level ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-20 space-y-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="text-xs text-primary"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Language */}
        <div className="space-y-3">
          <Label>Language</Label>
          <Select
            value={filters.language ?? 'all'}
            onValueChange={(value) => {
                handleUpdate({ language: value === 'all' ? undefined : value })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* Level */}
        <div className="space-y-3">
          <Label>Level</Label>
          <Select
            value={filters.level ?? 'all'}
            onValueChange={(value) =>
              handleUpdate({
                level: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-3">
          <Label>Price per Minute</Label>
          <Slider
            min={0}
            max={maxPriceLimit}
            step={5}
            value={[
              filters.minPrice ?? 0,
              filters.maxPrice ?? maxPriceLimit,
            ]}
            onValueChange={([min, max]) =>
              handleUpdate({
                minPrice: min === 0 ? undefined : min,
                maxPrice: max === maxPriceLimit ? undefined : max,
              })
            }
            disabled={isLoading}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.minPrice ?? 0}</span>
            <span>${filters.maxPrice ?? maxPriceLimit}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label>Minimum Rating</Label>
          <Select
            value={(filters.minRating ?? 0).toString()}
            onValueChange={(value) =>
              handleUpdate({
                minRating:
                  value === '0' ? undefined : Number(value),
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Ratings</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  )
}