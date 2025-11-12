"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useReports(range: "weekly" | "monthly") {
  const { data, error, isLoading, mutate } = useSWR(`/api/reports?range=${range}`, fetcher)
  return { data, error, isLoading, mutate }
}
