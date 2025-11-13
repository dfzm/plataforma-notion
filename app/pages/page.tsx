import { redirect } from "next/navigation";

import { PagesView } from "@/components/pages-view";
import { getServerUser } from "@/lib/auth/server-user";
import { getPagesByUser } from "@/lib/storage/pages";

export default async function PagesPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const pages = (await getPagesByUser(user.id)).map((page) => ({
    id: page.id,
    title: page.title,
    updatedAt: page.updatedAt,
    createdAt: page.createdAt,
  }));

  return <PagesView user={user} pages={pages} />;
}
