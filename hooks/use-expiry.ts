"use client"

import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useExpiryData() {
  const { data, error, isLoading, mutate } = useSWR("/api/expiry", fetcher)
  return { data, error, isLoading, mutate }
}
