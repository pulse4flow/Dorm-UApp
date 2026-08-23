import { SiteHeader } from "@/components/site-header";
import { Tasks } from "@/components/tasks";
export default function TasksPage() { return <><SiteHeader /><main className="content"><div className="page-heading"><div><p className="eyebrow">Only on this device</p><h1>My tasks</h1></div></div><Tasks /></main></>; }
