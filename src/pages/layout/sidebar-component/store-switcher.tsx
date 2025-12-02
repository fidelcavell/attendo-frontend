"use client";

import { ChevronsUpDown, Home, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLoginContext } from "@/hooks/useLogin";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function StoreSwitcher() {
  const { currentUser, currentStore, setCurrentStore, ownedStoreData } =
    useLoginContext();
  const { isMobile } = useSidebar();

  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full"
            asChild={currentUser?.role == "ROLE_OWNER"}
          >
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Home className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-xs">Toko terpilih saat ini :</span>
                <span className="truncate font-medium">
                  {currentStore?.name ?? "NONE"}
                </span>
              </div>
              {currentUser?.role == "ROLE_OWNER" ? (
                <ChevronsUpDown className="ml-auto" />
              ) : (
                ""
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {!currentUser?.idAssociateStore &&
          currentUser?.role == "ROLE_OWNER" ? (
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Daftar Toko
              </DropdownMenuLabel>

              {ownedStoreData.map((currentStore) => (
                <DropdownMenuItem
                  key={currentStore.id}
                  onClick={() => setCurrentStore(currentStore)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Home className="size-3.5 shrink-0" />
                  </div>
                  {currentStore.name}{" "}
                  <Badge
                    variant={currentStore.active ? "default" : "destructive"}
                  >
                    {currentStore.active ? "Activate" : "Deactivate"}
                  </Badge>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => navigate("/add-store")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Tambah toko baru
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          ) : null}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
