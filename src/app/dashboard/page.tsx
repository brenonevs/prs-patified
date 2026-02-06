"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * Redireciona /dashboard para Patinho da Vez para ser a primeira tela ao entrar na área interna.
 */
export default function DashboardPage() {
  const router = useRouter()
  React.useEffect(() => {
    router.replace("/dashboard/patinho-da-vez")
  }, [router])
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
