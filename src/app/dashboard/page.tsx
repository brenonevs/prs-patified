"use client"

import * as React from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import {
  PartidasTable,
  type PartidaRow,
} from "@/components/partidas-table"
import { SectionCards, type PatifyStats } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [stats, setStats] = React.useState<PatifyStats | null>(null)
  const [partidas, setPartidas] = React.useState<PartidaRow[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/partidas").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([statsData, partidasData]) => {
        if (statsData) setStats(statsData)
        if (partidasData) setPartidas(partidasData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <SectionCards stats={stats ?? undefined} />
            )}
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div className="px-4 lg:px-6">
              <PartidasTable data={partidas} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
