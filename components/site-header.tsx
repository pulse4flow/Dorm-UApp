"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["/", "Home"],
  ["/announcements", "Announcements"],
  ["/search", "Search"],
  ["/tasks", "Tasks"],
  ["/bookmarks", "Bookmarks"],
  ["/maintenance", "Maintenance"],
  ["/dorm-info", "Dorm Info"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="DormDash home">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span>Dorm<span className="brand-accent">Dash</span></span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={active(href) ? "active" : undefined}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link href="/admin/login" className="admin-link">Admin</Link>
        </div>
      </div>
    </header>
  );
}
