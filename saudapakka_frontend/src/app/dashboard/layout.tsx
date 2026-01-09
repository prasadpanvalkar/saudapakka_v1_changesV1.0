// src/app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Heart,
  Home,
  UserCircle
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, checkUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // STEP 1: Wait for mounting and rehydration
  useEffect(() => {
    const init = async () => {
      await useAuth.persist.rehydrate();
      setMounted(true);
    };
    init();
  }, []);

  // STEP 2: Verify Auth only after mounting
  useEffect(() => {
    if (!mounted) return;

    const verify = async () => {
      try {
        await checkUser();
        setAuthReady(true);
      } catch (err) {
        router.replace("/login?expired=true");
      }
    };
    verify();
  }, [mounted, checkUser, router]);

  // STEP 3: Handle Final Redirects
  useEffect(() => {
    if (authReady && !user) {
      router.replace("/login");
    }
  }, [authReady, user, router]);

  // Get user role badge
  const getUserRole = () => {
    if (user?.is_staff) return { label: "Administrator", color: "bg-red-600" };
    if (user?.is_active_broker) return { label: "Broker", color: "bg-blue-500" };
    if (user?.is_active_seller) return { label: "Seller", color: "bg-purple-500" };
    return { label: "Consumer", color: "bg-accent-green" };
  };

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    router.push("/login");
  };

  // HYDRATION SHIELD
  if (!mounted || !authReady || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4A9B6D] rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Synchronizing Saudapakka...</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRole();

  const navigation = [
    { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    ...(user?.is_active_seller || user?.is_active_broker
      ? [{ name: "My Listings", href: "/dashboard/my-listings", icon: Building2 }]
      : [{ name: "Saved Properties", href: "/dashboard/saved", icon: Heart }]),
    { name: "Identity Verification", href: "/dashboard/kyc", icon: ShieldCheck },
    // { name: "My Profile", href: "/dashboard/profile", icon: UserCircle },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-dark-green text-white p-6 flex flex-col shadow-2xl z-[1000] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="mb-10 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                User<span className="text-accent-green">Portal</span>
              </h2>
              <p className="text-xs text-white/50 uppercase tracking-widest">Saudapakka</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-primary-green text-white shadow-lg shadow-black/20"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Back to Home Link */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 group"
            >
              <Home className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-accent-green flex items-center justify-center text-dark-green font-bold text-lg shadow-lg">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {user?.full_name || user?.email?.split('@')[0] || "User"}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${userRole.color} text-white uppercase tracking-wide`}>
                  {userRole.label}
                </span>
                {user?.kyc_verified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white uppercase tracking-wide">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 py-3 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 bg-gray-50 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl tracking-tight">
              User<span className="text-accent-green">Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${userRole.color} text-white uppercase tracking-wide`}>
              {userRole.label}
            </span>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
