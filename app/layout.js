import { Inter, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Plataforma Noion",
  description: "Un espacio de trabajo colaborativo para tu equipo",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${robotoMono.variable} dark`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
