import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "DormDash", description: "Official campus information, organized your way." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
