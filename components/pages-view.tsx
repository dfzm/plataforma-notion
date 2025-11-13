"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Plus } from "lucide-react"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
type PageRecord = {
  id: string
  title: string | null
  updatedAt: string | null
  createdAt: string | null
}

interface PagesViewProps {
  user: {
    id: string
    email: string
    name: string
  }
  pages: PageRecord[]
}

export function PagesView({ user, pages }: PagesViewProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  )

  const formatDate = (value: string | null) => {
    if (!value) return "Sin registro"
    try {
      return dateFormatter.format(new Date(value))
    } catch (error) {
      console.error("Error al formatear la fecha:", error)
      return value
    }
  }

  const handleCreatePage = async () => {
    setIsCreating(true)

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
    } finally {
      setIsCreating(false)
    }
  }

  const totalPages = pages.length

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCreatePage={handleCreatePage} />

      <div className="md:ml-64">
        <header className="border-b border-border bg-background">
          <div className="flex flex-col gap-4 px-8 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Páginas</h1>
              <p className="text-sm text-muted-foreground">
                Administra y accede rápidamente a todas tus páginas creadas.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Total: {totalPages}</span>
              <Button onClick={handleCreatePage} disabled={isCreating} className="gap-2">
                <Plus className="h-4 w-4" />
                {isCreating ? "Creando..." : "Nueva página"}
              </Button>
            </div>
          </div>
        </header>

        <main className="px-8 py-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Listado de páginas</CardTitle>
              <CardDescription>
                Selecciona una página para continuar editando su contenido o crear una nueva desde cero.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalPages === 0 ? (
                <div className="py-10 text-center">
                  <p className="mb-4 text-muted-foreground">Aún no has creado ninguna página.</p>
                  <Button onClick={handleCreatePage} disabled={isCreating} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Creando..." : "Crear primera página"}
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Actualizada</TableHead>
                      <TableHead>Creada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => {
                      const title = page.title?.trim() ? page.title : "Sin título"

                      return (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground">{title}</div>
                            <div className="text-xs text-muted-foreground">ID: {page.id}</div>
                          </TableCell>
                          <TableCell>{formatDate(page.updatedAt ?? page.createdAt)}</TableCell>
                          <TableCell>{formatDate(page.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm" className="gap-2">
                              <Link href={`/page/${page.id}`}>
                                <ArrowUpRight className="h-4 w-4" />
                                Abrir
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}


