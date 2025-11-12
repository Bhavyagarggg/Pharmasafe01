"use client"

import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function usePredictions() {
  const { data, error, isLoading, mutate } = useSWR("/api/predictions", fetcher)
  return { data, error, isLoading, mutate }
}
