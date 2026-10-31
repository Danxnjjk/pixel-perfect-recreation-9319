import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, CreditCard, Landmark } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Lançamentos", url: "/lancamentos", icon: ArrowLeftRight },
  { title: "Contas e categorias", url: "/contas", icon: Wallet },
  { title: "Investimentos", url: "/investimentos", icon: TrendingUp },
  { title: "Cartões", url: "/cartoes", icon: CreditCard },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-4" />
          </div>
          <span className="font-display text-base font-semibold group-data-[collapsible=icon]:hidden">Patrimônio</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={path === i.url} tooltip={i.title}>
                    <Link to={i.url}>
                      <i.icon />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
