import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server-user";
import { TasksView } from "@/components/tasks";

export default async function TasksPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return <TasksView user={user} />;
}