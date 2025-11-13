import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { loadDatabase } from "@/lib/storage/database";
import { StoredBlock, StoredPage } from "@/lib/storage/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Task {
  id: string;
  label: string;
  completed: boolean;
  pageId: string;
  pageTitle: string;
}

async function getAllTasks(userId: string): Promise<Task[]> {
  const db = await loadDatabase();
  const userPages = db.pages.filter(
    (page) => page.userId === userId && !page.isArchived
  );
  const userPageIds = new Set(userPages.map((p) => p.id));

  const todoBlocks = db.blocks.filter(
    (block) =>
      userPageIds.has(block.pageId) &&
      block.type === "todo" &&
      block.userId === userId
  );

  const tasks: Task[] = todoBlocks
    .map((block) => {
      const page = userPages.find((p) => p.id === block.pageId);
      if (!page) return null;

      const isCompleted = block.properties?.checked === true;
      if (isCompleted) return null;

      return {
        id: block.id,
        label: block.content,
        completed: isCompleted,
        pageId: page.id,
        pageTitle: page.title || "Sin título",
      };
    })
    .filter((task): task is Task => task !== null);

  return tasks;
}

export default async function TasksPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const tasks = await getAllTasks(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <header className="border-b border-border bg-background">
          <div className="px-8 py-4">
            <h1 className="text-3xl font-bold text-foreground">Tareas</h1>
          </div>
        </header>
        <main className="px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground">
                  No tienes tareas pendientes.
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        disabled
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className="text-base text-foreground"
                      >
                        {task.label}
                      </label>
                      <Link href={`/page/${task.pageId}`} className="ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground"
                        >
                          <FileText className="h-4 w-4" /> {task.pageTitle}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
