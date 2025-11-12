"use client"

import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useStockPrioritization() {
  const { data, error, isLoading, mutate } = useSWR("/api/stock/prioritization", fetcher)
  return { data, error, isLoading, mutate }
}
