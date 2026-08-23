import { AnnouncementBrowser } from "@/components/announcement-browser";
import { SiteHeader } from "@/components/site-header";
import { getPublicAnnouncements } from "@/lib/announcements";

export const dynamic = "force-dynamic";
export default async function Home() {
  const announcements = await getPublicAnnouncements();
  return <><SiteHeader /><main><section className="hero"><p className="eyebrow">Centralized information, personalized locally</p><h1>Know what needs<br />your attention.</h1><p>Official campus and dorm updates, without another account.</p></section><AnnouncementBrowser initial={announcements} title="What’s happening now" /></main></>;
}
