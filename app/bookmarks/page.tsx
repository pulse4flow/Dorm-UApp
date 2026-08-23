import { AnnouncementBrowser } from "@/components/announcement-browser";
import { SiteHeader } from "@/components/site-header";
import { getPublicAnnouncements } from "@/lib/announcements";
export const dynamic = "force-dynamic";
export default async function BookmarksPage() { return <><SiteHeader /><main><AnnouncementBrowser initial={await getPublicAnnouncements()} title="Your bookmarks" bookmarkedOnly /></main></>; }
