"use client"

import * as React from "react"
import Link from "next/link"
import { IconPhotoOff } from "@tabler/icons-react"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type BibliotecaItem = {
  id: string
  jogo: string
  fotoUrl: string | null
  data: string
}

export default function BibliotecaPatificadasPage() {
  const [itens, setItens] = React.useState<BibliotecaItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/partidas/biblioteca")
        if (!res.ok) {
          setError("Não foi possível carregar a biblioteca.")
          return
        }
        const data = (await res.json()) as BibliotecaItem[]
        if (!cancelled) {
          setItens(data.filter((p) => p.fotoUrl))
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

  return (
    <>
      <SiteHeader title="Biblioteca de Patificadas" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <p className="px-4 text-muted-foreground lg:px-6">
              Todas as fotos de comprovação já enviadas na plataforma.
            </p>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-4 w-1/2" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="Não foi possível carregar"
                description={error}
                icon={<IconPhotoOff className="size-7" />}
                minHeight="min-h-[320px]"
                className="[&_p]:text-destructive [&_[data-slot=icon]]:bg-destructive/10 [&_[data-slot=icon]]:text-destructive"
              />
            ) : itens.length === 0 ? (
              <EmptyState
                title="Nenhuma foto na plataforma ainda"
                description="Quando partidas forem cadastradas com foto de comprovação, elas aparecerão aqui."
                icon={<IconPhotoOff className="size-7" />}
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
              <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6 xl:grid-cols-4">
                {itens.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <div className="relative aspect-video w-full bg-muted">
                      <img
                        src={p.fotoUrl?.startsWith("http") ? p.fotoUrl : `/api/partidas/foto/${p.fotoUrl}`}
                        alt={`Prova: ${p.jogo ?? "Partida"} - ${p.data}`}
                        className="size-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <p className="font-medium leading-tight">
                        {p.jogo ?? "Partida"}
                      </p>
                    </CardHeader>
                    <CardFooter className="pt-0 text-muted-foreground text-sm">
                      {p.data}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
