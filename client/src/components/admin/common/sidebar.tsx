import { BadgePercent, BarChart3, LayoutDashboard, Menu, Package, Settings2, Store, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: BadgePercent },
  { label: "Orders", href: "/admin/orders", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];

const linkBase = "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors";

const activeLink = "bg-sidebar-primary text-sidebar-primary-foreground";

const inactiveLink = "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin navigation" className="space-y-1 p-3">
      {adminNavItems.map(({ label, href, icon: Icon }) => (
        <NavLink key={href} to={href} end={href === "/admin"} onClick={onNavigate} className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}>
          <Icon className="h-4.5 w-4.5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-18 items-center border-b border-sidebar-border px-6">
        <NavLink to="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Store className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-semibold">E-Shopify</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}

export function AdminMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      <NavLink to="/admin" className="flex items-center gap-2">
        <Store className="h-6 w-6" />
        <span className="font-semibold">E-Shopify</span>
      </NavLink>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-6 py-4 text-left">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Store className="h-5 w-5" />
              </div>

              <div>
                <p className="text-base font-semibold">E-Shopify</p>
                <p className="text-xs font-normal text-muted-foreground">Admin Panel</p>
              </div>
            </SheetTitle>
          </SheetHeader>

          <Separator />

          <SidebarNav />
        </SheetContent>
      </Sheet>
    </header>
  );
}
