"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Gráfico de partidas ao longo do tempo"

const chartData = [
  { date: "2025-01-20", fuiPatificado: 1, patifiquei: 2 },
  { date: "2025-01-21", fuiPatificado: 0, patifiquei: 1 },
  { date: "2025-01-22", fuiPatificado: 2, patifiquei: 1 },
  { date: "2025-01-23", fuiPatificado: 1, patifiquei: 0 },
  { date: "2025-01-24", fuiPatificado: 1, patifiquei: 2 },
  { date: "2025-01-25", fuiPatificado: 0, patifiquei: 1 },
  { date: "2025-01-26", fuiPatificado: 2, patifiquei: 1 },
  { date: "2025-01-27", fuiPatificado: 1, patifiquei: 1 },
  { date: "2025-01-28", fuiPatificado: 1, patifiquei: 0 },
  { date: "2025-01-29", fuiPatificado: 0, patifiquei: 2 },
  { date: "2025-01-30", fuiPatificado: 2, patifiquei: 1 },
  { date: "2025-01-31", fuiPatificado: 1, patifiquei: 1 },
  { date: "2025-02-01", fuiPatificado: 1, patifiquei: 2 },
  { date: "2025-02-02", fuiPatificado: 0, patifiquei: 1 },
  { date: "2025-02-03", fuiPatificado: 1, patifiquei: 1 },
]

const chartConfig = {
  date: {
    label: "Data",
  },
  fuiPatificado: {
    label: "Fui patificado",
    color: "var(--primary)",
  },
  patifiquei: {
    label: "Patifiquei",
    color: "var(--secondary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const referenceDate = new Date("2025-02-03")
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Partidas ao longo do tempo</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Fui patificado vs. Patifiquei por dia
          </span>
          <span className="@[540px]/card:hidden">Partidas por dia</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 24, bottom: 28, left: 10 }}
          >
            <defs>
              <linearGradient id="fillFuiPatificado" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-fuiPatificado)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-fuiPatificado)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPatifiquei" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-patifiquei)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-patifiquei)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <YAxis domain={[0, "auto"]} hide />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="fuiPatificado"
              type="natural"
              fill="url(#fillFuiPatificado)"
              stroke="var(--color-fuiPatificado)"
              stackId="a"
            />
            <Area
              dataKey="patifiquei"
              type="natural"
              fill="url(#fillPatifiquei)"
              stroke="var(--color-patifiquei)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
