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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

type PatinhoDaVezUser = {
  id: string
  name: string
  steamUsername: string | null
  image: string | null
  rank: number
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function PatinhoDaVezPage() {
  const [user, setUser] = React.useState<PatinhoDaVezUser | null | undefined>(undefined)

  React.useEffect(() => {
    fetch("/api/patinho-da-vez")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data: { user: PatinhoDaVezUser | null }) => setUser(data.user))
      .catch(() => setUser(null))
  }, [])

  const displayName = user ? (user.steamUsername ?? user.name) : ""

  return (
    <>
      <SiteHeader title="Patinho da Vez" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
            <Card>
              <CardHeader className="pb-2 text-center">
                <CardTitle className="flex flex-wrap items-center justify-center gap-2 text-xl md:text-3xl">
                  <span role="img" aria-hidden>🦆</span>
                  <span>Patinho da Vez</span>
                  <span role="img" aria-hidden>🦆</span>
                </CardTitle>
                <CardDescription>
                  O último colocado do ranking entre os cadastrados — o mais patificado de todos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6 pb-8">
                {user === undefined ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="size-10 animate-spin text-muted-foreground" />
                  </div>
                ) : user === null ? (
                  <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center text-muted-foreground">
                    <p className="text-lg">Ainda não há ninguém no ranking cadastrado na plataforma.</p>
                    <p className="mt-2 text-sm">Cadastre partidas e apareça aqui (ou evite ser o patinho).</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-center gap-4 text-4xl md:text-5xl" aria-hidden>
                      🦆 🦆 🦆
                    </div>
                    <div className="relative w-full max-w-md">
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-4 border-amber-500/40 bg-muted shadow-xl ring-2 ring-amber-500/20 md:max-w-sm md:rounded-3xl">
                        <Avatar className="size-full rounded-none">
                          <AvatarImage src={user.image ?? undefined} alt={displayName} className="object-cover" />
                          <AvatarFallback className="text-4xl md:text-6xl text-muted-foreground">
                            {getInitials(displayName || user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 md:p-6">
                          <p className="text-center text-lg font-bold text-white drop-shadow-md md:text-xl">
                            Patinho mais patificado de todos
                          </p>
                          <p className="text-center text-base font-medium text-amber-200 md:text-lg">
                            A danada mais danada de todas
                          </p>
                          <p className="mt-2 text-center text-2xl font-bold text-white drop-shadow-md md:text-3xl">
                            {displayName}
                          </p>
                          <p className="text-sm text-white/80">
                            {user.rank}º no ranking
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-4xl md:text-5xl" aria-hidden>
                      🦆 🦆 🦆
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
