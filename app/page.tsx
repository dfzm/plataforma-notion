import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Zap, Users, Lock } from "lucide-react"
import Link from "next/link"

import { getServerUser } from "@/lib/auth/server-user"

export default async function HomePage() {
  const user = await getServerUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">NotionLike</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-foreground">Tu espacio de trabajo para todo</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Escribe, planifica, colabora y organiza. Todo en un solo lugar.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Comenzar gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Editor potente</h3>
            <p className="text-muted-foreground">
              Crea documentos increíbles con nuestro editor basado en bloques. Agrega títulos, listas, tareas y más.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Organiza todo</h3>
            <p className="text-muted-foreground">
              Mantén todas tus páginas organizadas en una estructura jerárquica. Encuentra lo que necesitas al instante.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Seguro y privado</h3>
            <p className="text-muted-foreground">
              Tus datos están cifrados y seguros. Solo tú tienes acceso a tu espacio de trabajo.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
