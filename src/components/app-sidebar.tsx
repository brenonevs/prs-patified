"use client"

import * as React from "react"
import { IconDashboard, IconPhotoPlus } from "@tabler/icons-react"

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
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Converter", url: "/converter", icon: IconPhotoPlus },
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
  const displayUser = user ?? data.user;
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
                <PatifiedLogo className="!size-11 shrink-0 brightness-0 invert opacity-90" />
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
