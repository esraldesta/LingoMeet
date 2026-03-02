export * from "./professional"
export * from "./room"
export * from "./booking"

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}