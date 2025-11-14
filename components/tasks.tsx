"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type User = {
  id: string;
  email: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  dueDate: string; // ISO date (YYYY-MM-DD)
  priority: "urgente" | "alta" | "media" | "baja";
  completed: boolean;
  createdAt: string; // ISO datetime
};

interface TasksViewProps {
  user: User;
}

export function TasksView({ user }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("media");

  // Load/persist in localStorage to keep demo data between refreshes
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("demo_tasks");
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        setTasks(parsed);
      }
    } catch (e) {
      console.warn("No se pudieron cargar las tareas del almacenamiento local", e);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("demo_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("No se pudieron guardar las tareas en almacenamiento local", e);
    }
  }, [tasks]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
      }),
    []
  );

  const addTask = () => {
    if (!title.trim() || !dueDate) return;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `${Date.now()}`,
      title: title.trim(),
      dueDate,
      priority,
      completed: false,
      createdAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDueDate("");
    setPriority("media");
  };

  const toggleCompleted = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => t.priority === "urgente")
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : a.dueDate < b.dueDate ? -1 : 0));
  }, [tasks]);

  const otherTasks = useMemo(() => {
    return tasks
      .filter((t) => t.priority !== "urgente")
      .sort((a, b) => (a.dueDate < b.dueDate ? 1 : a.dueDate > b.dueDate ? -1 : 0)); // más recientes primero
  }, [tasks]);

  const groupsByDate = useMemo(() => {
    const groups = new Map<string, Task[]>();
    for (const t of otherTasks) {
      const key = t.dueDate;
      const list = groups.get(key) ?? [];
      list.push(t);
      groups.set(key, list);
    }
    // Sort keys by date desc (más reciente primero)
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    return sortedKeys.map((key) => ({ key, items: groups.get(key)! }));
  }, [otherTasks]);

  const handleCreatePage = async () => {
    // Navegación rápida para crear página como en otras vistas
    // (solo UI; la página real se crea desde el endpoint en otros módulos)
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) throw new Error("No se pudo crear la página");
      const { page } = await response.json();
      window.location.href = `/page/${page.id}`;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCreatePage={handleCreatePage} />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b border-border bg-background">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-3xl font-bold text-foreground">Tareas</h1>
            <div className="flex items-center gap-3">
              <Button onClick={addTask} disabled={!title.trim() || !dueDate}>
                Agregar tarea
              </Button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="px-8 py-8">
          {/* Creator */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle>Nueva tarea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm text-muted-foreground">Título</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escribe el título de la tarea"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm text-muted-foreground">Fecha límite</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm text-muted-foreground">Prioridad</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={addTask} disabled={!title.trim() || !dueDate}>
                  Crear tarea
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Urgent tasks */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Tareas urgentes</h2>
            <Card className="border-border">
              <CardContent className="p-6">
                {urgentTasks.length === 0 ? (
                  <p className="text-muted-foreground">No hay tareas urgentes.</p>
                ) : (
                  <div className="space-y-3">
                    {urgentTasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={t.completed} onCheckedChange={() => toggleCompleted(t.id)} />
                          <div>
                            <div className="font-medium text-foreground">{t.title}</div>
                            <div className="text-xs text-muted-foreground">Vence: {dateFormatter.format(new Date(t.dueDate))}</div>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-red-600">Urgente</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <Separator className="my-6" />

          {/* Other tasks grouped by date (most recent first) */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Otras tareas por fecha</h2>
            {groupsByDate.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Aún no has creado otras tareas.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {groupsByDate.map(({ key, items }) => (
                  <Card key={key} className="border-border">
                    <CardHeader>
                      <CardTitle>{dateFormatter.format(new Date(key))}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {items.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox checked={t.completed} onCheckedChange={() => toggleCompleted(t.id)} />
                            <div>
                              <div className="font-medium text-foreground">{t.title}</div>
                              <div className="text-xs text-muted-foreground">Prioridad: {t.priority}</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">Creada: {dateFormatter.format(new Date(t.createdAt))}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}