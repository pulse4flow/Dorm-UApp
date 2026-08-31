import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const facilities = [
  { name: "Laundry room", note: "2F, coin or card machine, open 06:00–22:00" },
  { name: "Shared kitchen", note: "1F, microwave + hot water, open 24h" },
  { name: "Study room", note: "3F, quiet hours enforced, open 06:00–24:00" },
  { name: "Lobby lounge", note: "Ground floor, seating + vending machines" },
  { name: "Bike parking", note: "Basement, residents only" },
  { name: "Elevators", note: "Two, operate 24h — service lift for moving" },
];

const rules = [
  "Quiet hours are 22:00–07:00 (Inside 23:00 on weekends).",
  "Guests must check in at the front desk and leave by 22:00.",
  "Smoking and cooking with open flames are not allowed in rooms.",
  "Keep fire doors shut; do not block corridors or exit routes.",
  "Air conditioner temperature below 25°C is a chargeable extra.",
];

export default function DormInfoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="content">
          <div className="page-heading">
            <div><p className="eyebrow">Resident handbook</p><h1>Room & Dorm Info</h1></div>
            <span className="sync">Dormpoon Hall · updated last month</span>
          </div>

          <div className="info-cols">
            <section className="info-block">
              <h2>Contact & hours</h2>
              <dl className="info-list">
                <div><dt>Front office</dt><dd>Room 101 (ground floor) · Mon–Sat 08:00–20:00, Sun 09:00–17:00</dd></div>
                <div><dt>Phone</dt><dd>02-071-0391 <span className="tag-inline">office</span> · 081-222-3344 <span className="tag-inline">24h guard</span></dd></div>
                <div><dt>Email</dt><dd>office@dormpoon.example · maint@dormpoon.example for repairs</dd></div>
                <div><dt>Emergency</dt><dd>Call the 24h guard first — fire 199 · ambulance 1669</dd></div>
                <div><dt>Wi-Fi</dt><dd>SSID <code>Dormpoon-5G</code>, password <code>dormdash2026</code>. Reset via the portal if it drops.</dd></div>
              </dl>
            </section>

            <section className="info-block">
              <h2>Facilities</h2>
              <ul className="facility-list">
                {facilities.map((facility) => <li key={facility.name}><strong>{facility.name}</strong><span>{facility.note}</span></li>)}
              </ul>
            </section>

            <section className="info-block">
              <h2>House rules</h2>
              <ul className="rule-list">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
            </section>

            <section className="info-block">
              <h2>Good to know</h2>
              <dl className="info-list">
                <div><dt>Move out</dt><dd>Give at least 30 days notice; room inspection before deposit refund.</dd></div>
                <div><dt>Deposit</dt><dd>Two months rent, refunded within 14 days of inspection.</dd></div>
                <div><dt>Bills</dt><dd>Electricity read on the 25th; rent due by the 1st (bank transfer or office).</dd></div>
                <div><dt>Lost keys</dt><dd>Report lost keys immediately — reissue cost 150 THB.</dd></div>
                <div><dt>Pets</dt><dd>Small caged pets only; register at the front office.</dd></div>
              </dl>
              <p className="info-note">Something broken? File a <Link href="/maintenance">Maintenance Request</Link> and we&apos;ll get it fixed — no account needed.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}