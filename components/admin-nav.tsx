"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
export function AdminNav() {
  const router = useRouter();
  return <header className="admin-nav"><Link className="brand" href="/admin"><span>◆</span> DormDash Admin</Link><nav><Link href="/admin/announcements">Announcements</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/tags">Tags</Link><button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); }}>Log out</button></nav></header>;
}
