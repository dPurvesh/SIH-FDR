import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { GovLayoutWrapper } from "@/components/GovLayoutWrapper";

export const metadata: Metadata = {
  title: "VISHWAS-FDR | AICTE Security Deposit & Lifecycle Portal",
  description:
    "AICTE Regulation Bureau: Enterprise Fixed Deposit Receipt & Security Deposit Management System. Smart India Hackathon 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-scale-normal">
      <body className="antialiased selection:bg-amber-100 selection:text-amber-900">
        <AppProvider>
          <GovLayoutWrapper>{children}</GovLayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
