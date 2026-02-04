"use client"

import * as React from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IconPlus, IconTrash } from "@tabler/icons-react"

type UserOption = { id: string; name: string }

const MEDALHAS: string[] = ["🥇", "🥈", "🥉"]

function getMedalha(pos: number): string {
  if (pos <= 3) return MEDALHAS[pos - 1]
  return `${pos}º`
}

export default function CadastrarPartidaPage() {
  const [users, setUsers] = React.useState<UserOption[]>([])
  const [posicoes, setPosicoes] = React.useState<string[]>(["", "", ""])
  const [jogo, setJogo] = React.useState("Straftat")
  const [foto, setFoto] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loadingUsers, setLoadingUsers] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: UserOption[]) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setFoto(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const clearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFoto(null)
    setPreviewUrl(null)
  }

  const setPosicao = (index: number, userId: string) => {
    setPosicoes((prev) => {
      const next = [...prev]
      next[index] = userId
      return next
    })
  }

  const adicionarPosicao = () => {
    setPosicoes((prev) => [...prev, ""])
  }

  const removerPosicao = (index: number) => {
    if (posicoes.length <= 3) return
    setPosicoes((prev) => prev.filter((_, i) => i !== index))
  }

  const disponiveisPara = (index: number) =>
    users.filter((u) => {
      const jaEscolhidoEmOutra = posicoes.some((id, i) => i !== index && id === u.id)
      const ehEstaPosicao = posicoes[index] === u.id
      return ehEstaPosicao || !jaEscolhidoEmOutra
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const preenchidos = posicoes.filter(Boolean)
    if (preenchidos.length < 3) {
      toast.error("Informe pelo menos os 3 primeiros lugares (1º, 2º e 3º).")
      return
    }
    if (new Set(preenchidos).size !== preenchidos.length) {
      toast.error("Cada jogador só pode aparecer em uma posição.")
      return
    }
    if (!jogo.trim()) {
      toast.error("Informe o jogo.")
      return
    }
    if (!foto) {
      toast.error("Envie uma foto como prova da partida.")
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("jogo", jogo.trim())
      formData.set("podium", JSON.stringify(preenchidos))
      formData.set("foto", foto)
      const res = await fetch("/api/partidas", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao cadastrar")
      }
      toast.success("Partida cadastrada! 🦆")
      setPosicoes(["", "", ""])
      setJogo("Straftat")
      clearPhoto()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar. Tente de novo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader title="Cadastrar partida" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 md:py-5">
          <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <CardHeader className="shrink-0 px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                <span role="img" aria-hidden>🦆</span>
                Cadastrar partida
              </CardTitle>
              <CardDescription className="text-sm">
                Cadastre a partida em que você patificou ou foi patificado. Jogadores por posição (1º, 2º…), jogo e foto obrigatórios. 🐤
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:gap-6"
              >
                <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-4 overflow-hidden lg:min-w-[300px] lg:gap-5">
                  <div className="flex min-h-0 flex-col justify-center gap-4 overflow-hidden lg:gap-6">
                    <div className="space-y-3 shrink-0">
                      <Label className="text-sm font-semibold md:text-base">
                        Ranking da partida
                      </Label>
                      <div className="flex flex-col gap-3 md:gap-4">
                        {posicoes.map((userId, index) => (
                          <div key={index} className="flex items-end gap-2">
                            <div className="flex-1 space-y-1.5">
                              <Label className="text-muted-foreground text-xs font-normal md:text-sm">
                                {index + 1 <= 3
                                  ? `${getMedalha(index + 1)} ${index + 1}º lugar`
                                  : `${index + 1}º lugar`}
                              </Label>
                              <Select
                                key={`pos-${index}-${posicoes.filter((_, i) => i !== index).join("-")}`}
                                value={userId || undefined}
                                onValueChange={(v) => setPosicao(index, v)}
                                disabled={loadingUsers}
                              >
                                <SelectTrigger className="h-9 w-full md:h-10">
                                  <SelectValue placeholder="Selecione o jogador" />
                                </SelectTrigger>
                                <SelectContent>
                                  {disponiveisPara(index).map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                      {u.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {posicoes.length > 3 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removerPosicao(index)}
                                aria-label="Remover posição"
                              >
                                <IconTrash className="size-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={adicionarPosicao}
                        >
                          <IconPlus className="size-4" />
                          Adicionar posição
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5 shrink-0">
                      <Label htmlFor="jogo" className="text-sm font-semibold md:text-base">
                        Jogo
                      </Label>
                      <Select value={jogo} onValueChange={setJogo}>
                        <SelectTrigger id="jogo" className="h-9 max-w-md md:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Straftat">Straftat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="shrink-0 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || loadingUsers}
                      size="default"
                      className="w-full md:min-w-[200px] lg:w-auto"
                    >
                      {isSubmitting ? "Cadastrando…" : "Cadastrar partida 🦆"}
                    </Button>
                  </div>
                </div>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden pt-4 lg:min-h-0 lg:pt-0">
                  <Label className="shrink-0 text-sm font-semibold md:text-base">
                    Foto (prova da partida)
                  </Label>
                  {!previewUrl ? (
                    <label
                      className={cn(
                        "flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-colors hover:border-muted-foreground/50 hover:bg-muted/30 min-h-[140px]"
                      )}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <span className="text-3xl md:text-4xl" role="img" aria-hidden>📷</span>
                      <span className="text-muted-foreground text-xs md:text-sm">
                        Arraste ou clique para enviar
                      </span>
                    </label>
                  ) : (
                    <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border bg-muted/20 min-h-[140px]">
                      <img
                        src={previewUrl}
                        alt="Preview da prova"
                        className="h-full w-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 md:bottom-3 md:right-3"
                        onClick={clearPhoto}
                      >
                        Trocar foto
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
