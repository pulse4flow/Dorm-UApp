import Link from "next/link";

const utilities = [
  { href: "/maintenance", label: "Maintenance Request", icon: "🔧", note: "Report an issue in your room or the dorm" },
  { href: "/dorm-info", label: "Room / Dorm Info", icon: "🏢", note: "Contacts, hours, facilities, rules & Wi-Fi" },
  { href: "/announcements", label: "Announcements", icon: "📢", note: "Official dorms updates and notices" },
  { href: "/tasks", label: "My Tasks", icon: "✅", note: "Your personal to-do list, kept on this device" },
];

export function UtilityGrid() {
  return (
    <div className="utility-grid" role="list">
      {utilities.map((utility) => (
        <Link className="utility-tile" key={utility.href} href={utility.href} role="listitem">
          <span className="utility-icon">{utility.icon}</span>
          <strong>{utility.label}</strong>
          <span>{utility.note}</span>
        </Link>
      ))}
    </div>
  );
}