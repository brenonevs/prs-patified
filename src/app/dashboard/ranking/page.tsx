"use client"

import * as React from "react"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { IconLoader2 } from "@tabler/icons-react"

const PONTOS_POR_PATIFICADA = 3
const PONTOS_POR_VEZ_PATIFICADO = -1

type RankingRow = {
  userId: string
  name: string
  jogo: string
  patificadas: number
  vezesPatificado: number
  cheatAttempts: number
  pontos: number
  rank: number
}

const top3Medals = ["🥇", "🥈", "🥉"] as const

const APELIDOS_POR_POSICAO: Record<number, string> = {
  1: "Rei da lagoa",
  2: "Rainha da lagoa",
  3: "Pato inferior",
  4: "Patinha escrava",
  5: "Pato patificado sem dó",
  6: "Patinho do pão gozado",
  7: "Pato humilhado sodomizado",
  8: "Patinha danada estuprada por todos",
  9: "Patinha safada corna sem futuro estuprada por todos",
  10: "BRUNNÃO",
}

const APELIDOS_GENERICOS = [
  "Patinha rebaixada",
  "Pato amassado",
  "Pão gozado",
  "Patinha safada",
  "Pato patificado sem dó",
]

function getApelido(rank: number): string {
  return (
    APELIDOS_POR_POSICAO[rank] ??
    APELIDOS_GENERICOS[(rank - 11) % APELIDOS_GENERICOS.length]
  )
}

const ROW_HEIGHT_CLASS = "h-14"

function RankCell({ rank }: { rank: number }) {
  if (rank > 3) {
    return (
      <span className="text-muted-foreground font-medium tabular-nums">
        {rank}º
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center gap-1.5">
      <span className="text-xl leading-none" role="img" aria-label={`Posição ${rank}`}>
        {top3Medals[rank - 1]}
      </span>
      <span className="font-bold tabular-nums">{rank}º</span>
    </span>
  )
}

export default function RankingPage() {
  const [ranking, setRanking] = React.useState<RankingRow[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/ranking")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: RankingRow[]) => setRanking(data))
      .catch(() => setRanking([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SiteHeader title="Ranking" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <span role="img" aria-hidden>
                    🦆
                  </span>
                  Quem é o pato mais brabo do lago?
                </CardTitle>
                <CardDescription className="text-base">
                  Pontuação: +{PONTOS_POR_PATIFICADA} por patificada, {PONTOS_POR_VEZ_PATIFICADO} por vez
                  patificado. O ranking segue a ordem dos pontos. 🐤
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                  <span role="img" aria-hidden>
                    🏆
                  </span>{" "}
                  Pódio dos três primeiros — os patos supremos e as danadinhas.
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : ranking.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Nenhuma partida registrada ainda. Seja o primeiro a patificar!
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-24 text-center">#</TableHead>
                          <TableHead>Jogador</TableHead>
                          <TableHead>Jogo</TableHead>
                          <TableHead className="text-right">Pontos</TableHead>
                          <TableHead className="text-right">
                            Patificadas
                          </TableHead>
                          <TableHead className="text-right">
                            Vezes patificado
                          </TableHead>
                          <TableHead className="text-right">
                            Total de partidas
                          </TableHead>
                          <TableHead className="text-right">
                            Trapaças
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ranking.map((row) => (
                          <TableRow
                            key={row.userId}
                            className={cn(
                              "transition-colors",
                              row.rank === 1 &&
                                "bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20",
                              row.rank === 2 &&
                                "bg-slate-400/10 dark:bg-slate-400/5 border-slate-400/20",
                              row.rank === 3 &&
                                "bg-amber-700/10 dark:bg-amber-700/5 border-amber-700/20"
                            )}
                          >
                            <TableCell
                              className={cn(
                                "text-center align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              <RankCell rank={row.rank} />
                            </TableCell>
                            <TableCell
                              className={cn(
                                "align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium flex items-center gap-1.5">
                                  {row.rank === 1 && (
                                    <span className="mr-0.5" role="img" aria-hidden>
                                      👑
                                    </span>
                                  )}
                                  {row.name}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs",
                                    row.rank <= 3
                                      ? "text-muted-foreground"
                                      : "text-muted-foreground/80 italic"
                                  )}
                                >
                                  {getApelido(row.rank)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-muted-foreground align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              {row.jogo}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums font-semibold align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              {row.pontos}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              {row.patificadas}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              {row.vezesPatificado}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums font-medium align-middle",
                                ROW_HEIGHT_CLASS
                              )}
                            >
                              {row.patificadas + row.vezesPatificado}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums align-middle",
                                ROW_HEIGHT_CLASS,
                                row.cheatAttempts > 0 && "text-destructive"
                              )}
                            >
                              {row.cheatAttempts}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-center text-sm text-muted-foreground">
                  <span role="img" aria-hidden>
                    🦆
                  </span>{" "}
                  Quer subir no ranking? Patifica mais e vira menos patinho.
                  Simples assim.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
