"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  FileText,
  CheckSquare,
  DollarSign,
  Search,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

interface Page {
  id: string;
  title: string;
  updatedAt: string;
}

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
  initialPages: Page[];
}

export function Dashboard({ user, initialPages }: DashboardProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const handleCreatePage = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la página");
      }

      const { page } = await response.json();

      router.push(`/page/${page.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error al crear la página:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Mock data for demo
  const stats = [
    { value: "12", label: "Tareas pendientes", icon: CheckSquare },
    { value: "8", label: "Facturas por vencer", icon: DollarSign },
    { value: "5", label: "Tareas completadas", icon: CheckSquare },
  ];

  const quickLinks = [
    { label: "Nueva página", icon: Plus, action: handleCreatePage },
    {
      label: "Nueva tarea",
      icon: CheckSquare,
      action: () => router.push("/tasks"),
    },
    {
      label: "Nueva factura",
      icon: DollarSign,
      action: () => router.push("/invoices"),
    },
  ];

  const upcomingTasks = [
    { id: 1, label: "Preparar presentación", completed: false },
    { id: 2, label: "Revisar factura", completed: false },
  ];

  const userInitials = user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCreatePage={handleCreatePage} />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b border-border bg-background">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-3xl font-bold text-foreground">Inicio</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar"
                  className="w-64 pl-10 bg-muted/50 border-border"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-muted text-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Mi cuenta</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 py-8">
          {/* Dashboard Stats */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Panel</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="border-border">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                      <div className="mb-2 text-6xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-base text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Pages */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Páginas recientes
              </h2>
              <Card className="border-border">
                <CardContent className="p-6">
                  {initialPages.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Aún no tienes páginas
                      </p>
                      <Button
                        onClick={handleCreatePage}
                        variant="link"
                        className="mt-2"
                      >
                        Crea tu primera página
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {initialPages.slice(0, 4).map((page) => (
                        <Link key={page.id} href={`/page/${page.id}`}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-base hover:bg-accent"
                          >
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">
                              {page.title || "Sin título"}
                            </span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Quick Links & Upcoming Tasks */}
            <div className="space-y-8">
              {/* Quick Links */}
              <section>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  Accesos rápidos
                </h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      {quickLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            onClick={link.action}
                            disabled={index === 0 && isCreating}
                            className="w-full justify-start gap-3 text-base hover:bg-accent"
                          >
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">
                              {link.label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Upcoming Tasks */}
              <section>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  Próximas tareas
                </h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <Checkbox id={`task-${task.id}`} />
                          <label
                            htmlFor={`task-${task.id}`}
                            className="text-base text-foreground cursor-pointer"
                          >
                            {task.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
