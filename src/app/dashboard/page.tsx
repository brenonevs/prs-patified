import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import {
  PartidasTable,
  type PartidaRow,
} from "@/components/partidas-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"

import partidasData from "./partidas.json"

const mockStats = {
  vezesPatificado: 12,
  vezesPatificou: 10,
  totalPartidas: 22,
  sequenciaAtual: 5,
}

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards stats={mockStats} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div className="px-4 lg:px-6">
              <PartidasTable data={partidasData as PartidaRow[]} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
