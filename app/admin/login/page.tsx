import Link from "next/link";
import { AdminAuthForm } from "@/components/admin-auth-form";
export default function AdminLogin() { return <main className="auth-page"><div><p className="eyebrow">DormDash administration</p><h1>Welcome back</h1><p>Manage official student information.</p><AdminAuthForm /><p><Link href="/admin/register">Need to register an authorized admin?</Link></p></div></main>; }
