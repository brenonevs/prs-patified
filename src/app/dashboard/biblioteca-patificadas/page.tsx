"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ImageOff, Trophy } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PodiumItem = {
  posicao: number
  nome: string
}

type ProvaItem = {
  id: string
  url: string
  jogo: string
  createdAt: string
  uploadedBy: {
    id: string
    name: string
    avatar: string | null
  }
  podium: PodiumItem[]
}

const ITEMS_PER_PAGE = 10

const MEDALHAS = ["🥇", "🥈", "🥉"]

function formatDateTime(dateString: string): { date: string; time: string } {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function BibliotecaPatificadasPage() {
  const [provas, setProvas] = React.useState<ProvaItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/provas")
        if (!res.ok) {
          setError("Não foi possível carregar a biblioteca.")
          return
        }
        const data = (await res.json()) as ProvaItem[]
        if (!cancelled) {
          setProvas(data)
        }
      } catch {
        if (!cancelled) setError("Erro ao carregar a biblioteca.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.ceil(provas.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProvas = provas.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <SiteHeader title="Biblioteca de Patificadas" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
              <p className="text-muted-foreground">
                Todas as fotos de comprovação já enviadas na plataforma.
              </p>
              {!loading && provas.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {provas.length} foto{provas.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="Não foi possível carregar"
                description={error}
                icon={<ImageOff className="size-7" />}
                minHeight="min-h-[320px]"
                className="[&_p]:text-destructive [&_[data-slot=icon]]:bg-destructive/10 [&_[data-slot=icon]]:text-destructive"
              />
            ) : provas.length === 0 ? (
              <EmptyState
                title="Nenhuma foto na plataforma ainda"
                description="Quando partidas forem cadastradas com foto de comprovação, elas aparecerão aqui."
                icon={<ImageOff className="size-7" />}
                action={
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/dashboard/cadastrar-partida">
                      Cadastrar partida
                    </Link>
                  </Button>
                }
                minHeight="min-h-[320px]"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6 xl:grid-cols-4">
                  {currentProvas.map((prova) => {
                    const { date, time } = formatDateTime(prova.createdAt)
                    return (
                      <Card key={prova.id} className="overflow-hidden">
                        <a
                          href={prova.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="relative aspect-video w-full bg-muted overflow-hidden">
                            <img
                              src={prova.url ?? ""}
                              alt={`Prova: ${prova.jogo}`}
                              className="size-full object-cover transition-transform hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        </a>
                        <CardContent className="p-4 space-y-3">
                          {/* Quem enviou */}
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage src={prova.uploadedBy.avatar ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(prova.uploadedBy.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate">
                              {prova.uploadedBy.name}
                            </span>
                          </div>

                          {/* Pódio resumido */}
                          {prova.podium.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <Trophy className="size-3.5 shrink-0 mt-0.5" />
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                                {prova.podium.slice(0, 3).map((p) => (
                                  <span key={p.posicao}>
                                    {MEDALHAS[p.posicao - 1] ?? `${p.posicao}º`} {p.nome}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="px-4 py-3 border-t text-xs text-muted-foreground flex justify-between">
                          <span>{prova.jogo}</span>
                          <span>{date} às {time}</span>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 px-4 py-4 lg:px-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="size-4" />
                      <span className="sr-only">Página anterior</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="icon"
                              onClick={() => goToPage(page)}
                              className="w-9"
                            >
                              {page}
                            </Button>
                          )
                        }
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="size-4" />
                      <span className="sr-only">Próxima página</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
