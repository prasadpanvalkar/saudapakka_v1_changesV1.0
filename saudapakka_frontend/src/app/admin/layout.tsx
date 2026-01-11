"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/layout/NotificationBell";
import Cookies from "js-cookie";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const checkAccess = () => {
            const token = Cookies.get("access_token");

            // If no token, definitely not logged in -> Redirect
            if (!token) {
                router.push("/login?redirect=/dashboard/admin");
                return;
            }

            // If we have a user, check permissions
            if (user) {
                if (!user.is_staff) {
                    setIsLoading(false); // Show fatal access denied
                } else {
                    setIsLoading(false); // Allow access
                }
                return;
            }
        };

        checkAccess();
    }, [user, router, mounted]);

    // PREVENT HYDRATION MISMATCH
    // Only render UI after client-side hydration is complete
    if (!mounted) {
        return null;
    }

    const token = Cookies.get("access_token");

    if (!token) {
        return null; // Redirecting...
    }

    if (!user) {
        // Token exists, waiting for user data...
        return (
            <div suppressHydrationWarning={true} className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user.is_staff) {
        return (
            <div suppressHydrationWarning={true} className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                    <p className="text-gray-500 mb-6">This area is reserved for administrators only.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-black transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 ml-72 bg-slate-50 min-h-screen flex flex-col transition-all">
                {/* Admin Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="h-8 w-[1px] bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{user?.full_name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Superuser</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
                                {user?.full_name?.[0] || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
