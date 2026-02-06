"use client"

import * as React from "react"
import { LayoutDashboard, Trophy, ClipboardList, Image, Users, AlertTriangle, Bird } from "lucide-react"

import { PatifiedLogo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const defaultUser = {
  name: "Usuário",
  email: "",
  avatar: "" as string | null,
}

const navMainItems = [
  { title: "Patinho da Vez", url: "/dashboard/patinho-da-vez", icon: Bird },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Ranking", url: "/dashboard/ranking", icon: Trophy },
  { title: "Cadastrar partida", url: "/dashboard/cadastrar-partida", icon: ClipboardList },
  { title: "Biblioteca de Patificadas", url: "/dashboard/biblioteca-patificadas", icon: Image, locked: true },
  { title: "Lobbies", url: "/dashboard/lobby", icon: Users },
  { title: "Log de trapaças", url: "/dashboard/log-trapacas", icon: AlertTriangle },
]

type SidebarUser = {
  name: string;
  email: string;
  avatar?: string | null;
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser | null;
}) {
  const displayUser = user ?? defaultUser;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                <PatifiedLogo className="!size-8 shrink-0 brightness-0 invert opacity-90" />
                <span className="text-base font-semibold">Patified</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayUser.name,
            email: displayUser.email,
            avatar: displayUser.avatar ?? null,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
