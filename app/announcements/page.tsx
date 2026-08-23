import { AnnouncementBrowser } from "@/components/announcement-browser";
import { SiteHeader } from "@/components/site-header";
import { getPublicAnnouncements } from "@/lib/announcements";
export const dynamic = "force-dynamic";
export default async function AnnouncementsPage() { return <><SiteHeader /><main><AnnouncementBrowser initial={await getPublicAnnouncements()} /></main></>; }
