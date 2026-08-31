"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/announcements", "Announcements"],
  ["/admin/repairs", "Repairs"],
  ["/admin/categories", "Categories"],
  ["/admin/tags", "Tags"],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className="admin-nav">
      <div className="header-inner">
        <Link className="brand" href="/admin">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span>Dorm<span className="brand-accent">Dash</span> <small>Admin</small></span>
        </Link>
        <nav className="site-nav admin-site-nav" aria-label="Admin navigation">
          {links.map(([href, label]) => <Link key={href} href={href} className={active(href) ? "active" : undefined}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <button className="logout-button" onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/admin/login");
          }}>Log out</button>
        </div>
      </div>
    </header>
  );
}
