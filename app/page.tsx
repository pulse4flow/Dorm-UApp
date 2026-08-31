import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AnnouncementCard } from "@/components/announcement-card";
import { BookmarksWidget } from "@/components/dashboard/bookmarks-widget";
import { Countdown } from "@/components/countdown";
import { DashboardSearch } from "@/components/dashboard/search-bar";
import { MyTasksWidget } from "@/components/dashboard/my-tasks-widget";
import { UtilityGrid } from "@/components/dashboard/utility-grid";
import { getPublicAnnouncements } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export default async function Home() {
  const announcements = await getPublicAnnouncements();
  const latest = announcements.slice(0, 3);

  const now = Date.now();
  const upcoming = announcements
    .filter((item) => item.eventAt && +new Date(String(item.eventAt)) >= now)
    .sort((a, b) => +new Date(String(a.eventAt)) - +new Date(String(b.eventAt)))
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero dash-hero">
          <p className="eyebrow">Student Utility Dashboard</p>
          <h1>Everything for dorm life, in one place.</h1>
          <p>Announcements, maintenance, dorm info and your own to-do list — no account needed.</p>
          <DashboardSearch />
        </section>
        <div className="dashboard">
          <section>
            <div className="page-heading">
              <div><p className="eyebrow">Quick access</p><h2>Utilities</h2></div>
            </div>
            <UtilityGrid />
          </section>

          <section>
            <div className="page-heading">
              <div><p className="eyebrow">Stay informed</p><h2>Latest announcements</h2></div>
              <Link className="button secondary" href="/announcements">View all</Link>
            </div>
            {latest.length === 0
              ? <div className="empty">No announcements yet — the dorms will post updates here.</div>
              : <div className="feed">{latest.map((item) => <AnnouncementCard key={item.id} announcement={item} />)}</div>}
          </section>

          {upcoming.length > 0 && (
            <section>
              <div className="page-heading">
                <div><p className="eyebrow">Mark your calendar</p><h2>Upcoming events</h2></div>
              </div>
              <div className="event-list">
                {upcoming.map((item) => (
                  <Link key={item.id} className="event-row" href={`/announcements/${item.id}`}>
                    <span className="event-date">{new Date(String(item.eventAt)).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="event-title">{item.title}</span>
                    <Countdown target={String(item.eventAt)} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="dash-cols">
            <MyTasksWidget />
            <BookmarksWidget initial={announcements} />
          </div>
        </div>
      </main>
    </>
  );
}