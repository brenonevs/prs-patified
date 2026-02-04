import * as React from "react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  /** Título principal exibido no estado vazio. */
  title: string
  /** Descrição opcional abaixo do título. */
  description?: string
  /** Ícone ou ilustração (ex.: componente de ícone Tabler). */
  icon?: React.ReactNode
  /** Ação opcional (botão ou link) para o usuário. */
  action?: React.ReactNode
  /** Classe CSS adicional no container. */
  className?: string
  /** Altura mínima do bloco para centralização vertical (ex.: "min-h-[280px]"). */
  minHeight?: string
}

/**
 * Bloco centralizado para estado vazio, com título, descrição, ícone e ação opcional.
 * Uso consistente em listas, grids e tabelas sem dados.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  minHeight = "min-h-[280px]",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        minHeight,
        className
      )}
    >
      {icon && (
        <div
          data-slot="icon"
          className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
