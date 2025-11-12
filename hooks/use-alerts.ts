"use client"

import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR("/api/alerts", fetcher)
  return { data, error, isLoading, mutate }
}
