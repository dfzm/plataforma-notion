import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Revisa tu correo</CardTitle>
            <CardDescription className="text-center">Te enviamos un enlace de verificación</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Abre tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta. Puedes cerrar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
