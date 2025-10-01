import Link from "next/link";
import Image from "next/image";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

const LandingPage = async () => {
    const session = await auth.api.getSession({ headers: await headers() });

    if(session?.user) redirect('/dashboard');
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4">
                <Link href="/" className="flex items-center gap-3">
                    <Image 
                        src="/logo.svg" 
                        alt="Equinox logo" 
                        width={140} 
                        height={32} 
                        className="h-8 w-auto cursor-pointer"
                    />
                    <span className="text-2xl font-light text-white tracking-wider">EQUINOX</span>
                </Link>
                <div className="flex gap-4">
                    <Link 
                        href="/sign-in" 
                        className="text-gray-400 hover:text-white transition-colors px-4 py-2"
                    >
                        Sign In
                    </Link>
                    <Link 
                        href="/sign-up" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Welcome to <span className="text-yellow-500">Equinox</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Your ultimate platform for AI-powered stock analysis, portfolio management, and cutting-edge financial tools.
                    </p>
                    <Link 
                        href="/sign-up"
                        className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-8 text-center text-gray-500">
                <p>&copy; 2025 Equinox. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;