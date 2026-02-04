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
import { Loader2, AlertTriangle } from "lucide-react"

type UserCheatSummary = {
  id: string
  name: string
  steamUsername: string | null
  email: string
  cheatAttempts: number
}

type CheatLogEntry = {
  id: string
  createdAt: string
  jogo: string
  fotoUrl: string
  rankingEnviado: string[]
  rankingIdentificado: string[]
  user: {
    id: string
    name: string
    steamUsername: string | null
    email: string
  } | null
  partidaId: string
}

type CheatLogResponse = {
  users: UserCheatSummary[]
  logs: CheatLogEntry[]
}

function formatRanking(names: string[]): string {
  return names.map((name, i) => `${i + 1}º ${name}`).join(" → ")
}

export default function LogTrapacasPage() {
  const [users, setUsers] = React.useState<UserCheatSummary[]>([])
  const [logs, setLogs] = React.useState<CheatLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/cheat-log")
      .then((r) => (r.ok ? r.json() : { users: [], logs: [] }))
      .then((data: CheatLogResponse) => {
        setUsers(data.users ?? [])
        setLogs(data.logs ?? [])
      })
      .catch(() => {
        setUsers([])
        setLogs([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SiteHeader title="Log de trapaças" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <AlertTriangle className="size-6 text-amber-500" />
                  Tentativas de trapaça
                </CardTitle>
                <CardDescription>
                  Registro de quando a IA identificou um ranking diferente do informado na foto da partida. Exibe o usuário, o ranking que ele enviou, o ranking detectado na imagem e a foto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {users.length > 0 && (
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                      Usuários com tentativas de trapaça (total por usuário)
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {users.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          <span className="font-medium">
                            {u.steamUsername ?? u.name}
                          </span>
                          <span className="text-muted-foreground">
                            {u.cheatAttempts} tentativa(s)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/30 py-12 text-center text-sm text-muted-foreground">
                    Nenhuma tentativa de trapaça registrada.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">Data</TableHead>
                          <TableHead className="min-w-[160px]">Usuário</TableHead>
                          <TableHead>Jogo</TableHead>
                          <TableHead className="min-w-[200px]">Ranking enviado</TableHead>
                          <TableHead className="min-w-[200px]">Ranking na foto</TableHead>
                          <TableHead className="w-[100px] text-center">Foto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                              {new Date(entry.createdAt).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>
                              {entry.user ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium">
                                    {entry.user.steamUsername ?? entry.user.name}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {entry.user.email}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{entry.jogo}</span>
                            </TableCell>
                            <TableCell>
                              <p className="max-w-[280px] truncate text-sm" title={formatRanking(entry.rankingEnviado)}>
                                {formatRanking(entry.rankingEnviado)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="max-w-[280px] truncate text-sm text-emerald-600 dark:text-emerald-400" title={formatRanking(entry.rankingIdentificado)}>
                                {formatRanking(entry.rankingIdentificado)}
                              </p>
                            </TableCell>
                            <TableCell>
                              {entry.fotoUrl ? (
                                <a
                                  href={entry.fotoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex flex-col items-center gap-1"
                                >
                                  <img
                                    src={entry.fotoUrl}
                                    alt="Foto da partida"
                                    className="size-14 rounded border object-cover"
                                  />
                                  <span className="text-xs text-muted-foreground hover:underline">
                                    Abrir
                                  </span>
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
