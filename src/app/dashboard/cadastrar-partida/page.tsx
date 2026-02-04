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
import { PlayerCombobox, type PlayerOption } from "@/components/ui/player-combobox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react"

type PodiumEntry = {
  type: "user" | "guest"
  userId?: string
  playerName?: string
  inputValue: string 
}

const MEDALHAS: string[] = ["🥇", "🥈", "🥉"]

function getMedalha(pos: number): string {
  if (pos <= 3) return MEDALHAS[pos - 1]
  return `${pos}º`
}

const createEmptyEntry = (): PodiumEntry => ({
  type: "guest",
  inputValue: "",
})

export default function CadastrarPartidaPage() {
  const [users, setUsers] = React.useState<PlayerOption[]>([])
  const [posicoes, setPosicoes] = React.useState<PodiumEntry[]>([
    createEmptyEntry(),
    createEmptyEntry(),
    createEmptyEntry(),
  ])
  const [jogo, setJogo] = React.useState("Straftat")
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loadingUsers, setLoadingUsers] = React.useState(true)
  const [cheatingWarning, setCheatingWarning] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PlayerOption[]) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.set("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao fazer upload")
      }

      const { url } = await res.json()
      setImageUrl(url)
      setPendingFile(null)
      toast.success("Imagem enviada!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao enviar imagem"
      setUploadError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setImageUrl(null)
    setPendingFile(file)

    await uploadFile(file)
  }

  const retryUpload = async () => {
    if (pendingFile) {
      await uploadFile(pendingFile)
    }
  }

  const clearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setImageUrl(null)
    setPendingFile(null)
    setUploadError(null)
  }

  const handlePlayerChange = (index: number, value: string, selectedUser?: PlayerOption) => {
    setPosicoes((prev) => {
      const next = [...prev]
      if (selectedUser) {
        next[index] = {
          type: "user",
          userId: selectedUser.id,
          playerName: undefined,
          inputValue: selectedUser.name,
        }
      } else {
        next[index] = {
          type: "guest",
          userId: undefined,
          playerName: value.trim() || undefined,
          inputValue: value,
        }
      }
      return next
    })
  }

  const adicionarPosicao = () => {
    setPosicoes((prev) => [...prev, createEmptyEntry()])
  }

  const removerPosicao = (index: number) => {
    if (posicoes.length <= 1) return
    setPosicoes((prev) => prev.filter((_, i) => i !== index))
  }

  const nomesUsados = (exceptIndex: number) =>
    posicoes
      .filter((_, i) => i !== exceptIndex)
      .map((p) => p.inputValue.toLowerCase())
      .filter(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheatingWarning(false)

    const preenchidos = posicoes.filter((p) => p.inputValue.trim())
    if (preenchidos.length < 1) {
      toast.error("Informe pelo menos 1 jogador.")
      return
    }

    const nomes = preenchidos.map((p) => p.inputValue.toLowerCase().trim())
    if (new Set(nomes).size !== nomes.length) {
      toast.error("Cada jogador só pode aparecer em uma posição.")
      return
    }

    if (!jogo.trim()) {
      toast.error("Informe o jogo.")
      return
    }
    if (!imageUrl) {
      if (isUploading) {
        toast.error("Aguarde o upload da imagem terminar.")
      } else {
        toast.error("Envie uma foto como prova da partida.")
      }
      return
    }

    const podiumData = preenchidos.map((entry) => {
      if (entry.type === "user" && entry.userId) {
        return { userId: entry.userId }
      }
      return { playerName: entry.inputValue.trim() }
    })

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jogo: jogo.trim(),
          podium: podiumData,
          imageUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao cadastrar")
      }

      const result = await res.json()

      if (result.cheatingDetected) {
        setCheatingWarning(true)
        toast.warning("Ranking corrigido automaticamente. Tentativa de trapaça detectada!")
      } else {
        toast.success("Partida cadastrada! 🦆")
      }

      setPosicoes([createEmptyEntry(), createEmptyEntry(), createEmptyEntry()])
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
          {cheatingWarning && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="size-5 shrink-0" />
              <div>
                <p className="font-semibold">Tentativa de trapaça detectada!</p>
                <p className="text-sm opacity-90">
                  O ranking informado não correspondia à imagem. O ranking foi corrigido automaticamente e essa tentativa foi registrada.
                </p>
              </div>
            </div>
          )}
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
                        {posicoes.map((entry, index) => {
                          const usados = nomesUsados(index)
                          const sugestoes = users.filter(
                            (u) => !usados.includes(u.name.toLowerCase())
                          )
                          return (
                            <div key={index} className="flex items-end gap-2">
                              <div className="flex-1 space-y-1.5">
                                <Label className="text-muted-foreground text-xs font-normal md:text-sm">
                                  {index + 1 <= 3
                                    ? `${getMedalha(index + 1)} ${index + 1}º lugar`
                                    : `${index + 1}º lugar`}
                                </Label>
                                <PlayerCombobox
                                  value={entry.inputValue}
                                  onChange={(value, selectedUser) =>
                                    handlePlayerChange(index, value, selectedUser)
                                  }
                                  options={sugestoes}
                                  disabled={loadingUsers}
                                  isRegisteredUser={entry.type === "user"}
                                />
                              </div>
                              {posicoes.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 text-muted-foreground hover:text-destructive mb-1"
                                  onClick={() => removerPosicao(index)}
                                  aria-label="Remover posição"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={adicionarPosicao}
                        >
                          <Plus className="size-4" />
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
                      disabled={isSubmitting || loadingUsers || isUploading}
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
                        className={cn(
                          "h-full w-full object-contain",
                          (isUploading || uploadError) && "opacity-50"
                        )}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                          <div className="flex items-center gap-2 rounded-lg bg-background/90 px-4 py-2">
                            <Loader2 className="size-5 animate-spin" />
                            <span className="text-sm">Enviando...</span>
                          </div>
                        </div>
                      )}
                      {uploadError && !isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                          <div className="flex flex-col items-center gap-2 rounded-lg bg-background/90 px-4 py-3">
                            <AlertTriangle className="size-5 text-destructive" />
                            <span className="text-sm text-destructive">Falha no upload</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={retryUpload}
                            >
                              Tentar novamente
                            </Button>
                          </div>
                        </div>
                      )}
                      {!isUploading && !uploadError && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 right-2 md:bottom-3 md:right-3"
                          onClick={clearPhoto}
                        >
                          Trocar foto
                        </Button>
                      )}
                      {uploadError && !isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={clearPhoto}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
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
