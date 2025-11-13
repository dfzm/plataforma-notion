import { redirect } from "next/navigation"

import { PageEditor } from "@/components/page-editor"
import type { Block } from "@/components/block-editor"
import { getServerUser } from "@/lib/auth/server-user"
import { getBlocksByPage, getPageById } from "@/lib/storage/pages"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const user = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  const page = await getPageById(id)
  if (!page) {
    redirect("/dashboard")
  }

  const blocksData = await getBlocksByPage(id)

  const blocks: Block[] = blocksData.map((block) => ({
    id: block.id,
    type: block.type,
    content: block.content,
    checked: typeof block.properties?.checked === "boolean" ? (block.properties.checked as boolean) : undefined,
    position: block.position,
  }))

  return (
    <PageEditor
      pageId={id}
      user={user}
      initialPage={{
        id: page.id,
        title: page.title,
        user_id: page.userId,
      }}
      initialBlocks={blocks}
    />
  )
}
