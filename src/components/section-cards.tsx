"use client"

import {
  IconFlame,
  IconMoodSmile,
  IconRocket,
  IconTrophy,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type PatifyStats = {
  vezesPatificado: number
  vezesPatificou: number
  totalPartidas: number
  sequenciaAtual: number
}

const defaultStats: PatifyStats = {
  vezesPatificado: 0,
  vezesPatificou: 0,
  totalPartidas: 0,
  sequenciaAtual: 0,
}

export function SectionCards({ stats = defaultStats }: { stats?: PatifyStats }) {
  const { vezesPatificado, vezesPatificou, totalPartidas, sequenciaAtual } =
    stats

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vezes que patifiquei</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {vezesPatificou}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconRocket className="size-3.5" />
              Vitórias
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Quantas vezes eu patifiquei uma danadinha
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vezes que fui patificado</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {vezesPatificado}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconMoodSmile className="size-3.5" />
              Derrotas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Quantas vezes virei uma patinha danada
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de partidas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPartidas}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrophy className="size-3.5" />
              Geral
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Patificado + patificou (todas as partidas)
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sequência atual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {sequenciaAtual}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconFlame className="size-3.5" />
              Streak
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Partidas seguidas nesta temporada
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
