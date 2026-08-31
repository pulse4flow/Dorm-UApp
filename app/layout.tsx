import type { Metadata } from "next";
import "./globals.css";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "DormDash",
  description: "Dorm announcements, maintenance, tasks and essential information in one place.",
};

const themeScript = `
  try {
    const saved = localStorage.getItem("dormdash-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : preferred;
  } catch (_) { document.documentElement.dataset.theme = "light"; }
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
