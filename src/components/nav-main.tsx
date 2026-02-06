"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    locked?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <React.Fragment key={item.title}>
                <SidebarMenuItem className="border-b border-sidebar-border/40 last:border-b-0">
                  <SidebarMenuButton
                    tooltip={item.locked ? `${item.title} (bloqueado)` : item.title}
                    asChild
                    isActive={isActive && !item.locked}
                  >
                    {item.locked ? (
                      <span className="flex w-full cursor-not-allowed items-center gap-2 opacity-80">
                        {item.icon && <item.icon className="size-5 shrink-0" />}
                        <span className="flex-1 truncate">{item.title}</span>
                        <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                      </span>
                    ) : (
                      <Link href={item.url} className="flex items-center gap-2">
                        {item.icon && <item.icon className="size-5 shrink-0" />}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </React.Fragment>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
