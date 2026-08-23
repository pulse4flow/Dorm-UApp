import Link from "next/link";
import { AdminAuthForm } from "@/components/admin-auth-form";
export default function AdminRegister() { return <main className="auth-page"><div><p className="eyebrow">Authorized access only</p><h1>Register an admin</h1><p>The registration key is checked only by the server.</p><AdminAuthForm register /><p><Link href="/admin/login">Back to login</Link></p></div></main>; }
