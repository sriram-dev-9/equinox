import Link from "next/link";
import Image from "next/image";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() })

    if(session?.user) redirect('/dashboard')

    return (
        <main className="auth-layout-centered">
            <section className="auth-centered-section">
                <Link href="/" className="auth-logo-centered flex items-center gap-3">
                    <Image src="/logo.svg" alt="Equinox logo" width={140} height={32} className='h-8 w-auto' />
                    <span className="text-2xl font-light text-white tracking-wider">EQUINOX</span>
                </Link>

                <div className="auth-form-container">{children}</div>
            </section>
        </main>
    )
}
export default Layout
