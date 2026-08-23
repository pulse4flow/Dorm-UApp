import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { AnnouncementEditor } from "@/components/announcement-editor";
import { requireAdmin } from "@/lib/auth";
export default async function NewAnnouncement() { try { await requireAdmin(); } catch { redirect("/admin/login"); } return <><AdminNav /><main className="admin-content"><h1>New announcement</h1><AnnouncementEditor /></main></>; }
