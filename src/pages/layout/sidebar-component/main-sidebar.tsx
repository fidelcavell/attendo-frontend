"use client";

import * as React from "react";

import NavMenu from "@/pages/layout/sidebar-component/nav-menu";
import { NavUser } from "@/pages/layout/sidebar-component/user-account";
import { StoreSwitcher } from "@/pages/layout/sidebar-component/store-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nav: { menu: any[] };
}

export function AppSidebar({  nav, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMenu items={nav.menu} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
