"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  FileText,
  Home,
  CheckSquare,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onCreatePage?: () => void;
}

export function Sidebar({ onCreatePage }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Inicio", href: "/dashboard" },
    { icon: FileText, label: "Páginas", href: "/pages" },
    { icon: CheckSquare, label: "Tareas", href: "/tasks" },
    { icon: DollarSign, label: "Facturas", href: "/invoices" },
    { icon: Settings, label: "Configuración", href: "/settings" },
  ];

  const handleSignOut = async () => {
    startTransition(async () => {
      await logout();
      router.push("/login");
    });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* New Page Button */}
          <div className="p-4">
            <Button
              onClick={onCreatePage}
              variant="ghost"
              size="lg"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Plus className="h-5 w-5" />
              <span className="text-base">Nueva página</span>
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="lg"
                      className={cn(
                        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-base">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Logout Button */}
          <div className="p-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="lg"
              disabled={isPending}
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-base">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
