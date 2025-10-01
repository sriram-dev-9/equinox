import Header from "@/components/Header";
import { ChatProvider } from "@/components/ChatProvider";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatToggleButton } from "@/components/ChatToggleButton";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

const DashboardLayout = async ({ children }: { children : React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if(!session?.user) redirect('/sign-in');

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    }

    return (
        <ChatProvider>
            <main className="min-h-screen text-gray-400">
                <Header user={user} />
                {children}
                
                {/* Chat Components */}
                <ChatSidebar />
                <ChatToggleButton />
            </main>
        </ChatProvider>
    );
};

export default DashboardLayout;