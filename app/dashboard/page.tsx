import { redirect } from "next/navigation"

import { Dashboard } from "@/components/dashboard"
import { getServerUser } from "@/lib/auth/server-user"
import { getPagesByUser } from "@/lib/storage/pages"

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  const storedPages = await getPagesByUser(user.id)
  const pages = storedPages.map((page) => ({
    id: page.id,
    title: page.title,
    updatedAt: page.updatedAt,
  }))

  return <Dashboard user={user} initialPages={pages} />
}
