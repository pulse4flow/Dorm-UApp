import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header">
    <Link href="/" className="brand"><span>◆</span> DormDash</Link>
    <nav><Link href="/announcements">Announcements</Link><Link href="/bookmarks">Bookmarks</Link><Link href="/tasks">My tasks</Link><Link href="/admin/login">Admin</Link></nav>
  </header>;
}
