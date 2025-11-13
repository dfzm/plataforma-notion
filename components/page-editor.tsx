"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { BlockEditor, type Block } from "@/components/block-editor"

interface PageData {
  id: string
  title: string
  user_id: string
}

interface PageEditorProps {
  pageId: string
  user: {
    id: string
    email: string
    name: string
  }
  initialPage?: PageData
  initialBlocks?: Block[]
}

export function PageEditor({ pageId, user, initialPage, initialBlocks = [] }: PageEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialPage?.title || "Sin título")
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!initialPage) return

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        })
      } catch (error) {
        console.error("Error al guardar el título:", error)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [title, pageId, initialPage])

  const handleCreatePage = async () => {
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("No se pudo crear la página")
      }

      const { page } = await response.json()
      router.push(`/page/${page.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error al crear la página:", error)
    }
  }

  const handleDeletePage = async () => {
    if (!confirm("¿Seguro que quieres eliminar esta página?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("No se pudo eliminar la página")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar la página:", error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCreatePage={handleCreatePage} />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{isSaving ? "Guardando..." : "Guardado"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeletePage}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Editor */}
        <main className="mx-auto max-w-4xl px-6 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sin título"
            className="mb-4 w-full border-none bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground"
          />

          <BlockEditor
            pageId={pageId}
            userId={user.id}
            initialBlocks={blocks}
            onChange={setBlocks}
            onSavingChange={setIsSaving}
          />
        </main>
      </div>
    </div>
  )
}
