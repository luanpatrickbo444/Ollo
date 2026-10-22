import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Ollo — Inteligência Jurídica", description: "Assistente de pesquisa jurídica com IA." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
