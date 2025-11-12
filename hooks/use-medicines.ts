"use client"

import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMedicines() {
  const { data, error, isLoading, mutate } = useSWR("/api/medicines", fetcher)
  return { data, error, isLoading, mutate }
}
