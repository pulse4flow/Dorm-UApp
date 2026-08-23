import { AnnouncementBrowser } from "@/components/announcement-browser";
import { SiteHeader } from "@/components/site-header";
import { getPublicAnnouncements } from "@/lib/announcements";
export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) { return <><SiteHeader /><main><AnnouncementBrowser initial={await getPublicAnnouncements()} title="Search announcements" initialQuery={(await searchParams).q ?? ""} /></main></>; }
