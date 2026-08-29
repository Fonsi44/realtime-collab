import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Realtime Collab — Live Cursors & Sticky Notes",
  description:
    "Collaborative board with live cursors and shared sticky notes powered by Partykit WebSockets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={nunito.variable} style={{ colorScheme: "dark" }}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
