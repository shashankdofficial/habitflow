"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useSearchStore } from "@/hooks/useSearchStore";
import { LogoIcon, LogoFull } from "./Logo";

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { searchQuery, setSearchQuery } = useSearchStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (!user) return null;

  const userDisplayName = user.user_metadata?.name || "Friend";
  const userInitials = userDisplayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "US";

  // Navigation Items
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Calendar", href: "/calendar", icon: "calendar_month" },
    { label: "Analytics", href: "/analytics", icon: "insights" },
    { label: "Settings", href: "/settings", icon: "person" },
  ];

  return (
    <div className="bg-surface dark:bg-zinc-900 text-on-surface dark:text-zinc-100 font-sans h-screen flex flex-col overflow-hidden transition-colors duration-200">
      {/* TopAppBar Component */}
      <header className="w-full h-16 shrink-0 z-40 bg-surface dark:bg-zinc-900 shadow-sm border-b border-outline-variant/20 dark:border-zinc-800">
        <div className="flex justify-between items-center h-full px-margin-mobile md:px-margin-desktop w-full">
          <div className="flex items-center gap-8 flex-grow max-w-xl">
            <Link href="/dashboard" className="hover:opacity-95 shrink-0 flex items-center text-primary dark:text-white">
              <LogoIcon className="w-8 h-8 md:hidden" />
              <LogoFull className="w-36 h-9 hidden md:block" />
            </Link>
            {/* Search Bar */}
            <div className="flex items-center bg-surface-container dark:bg-zinc-800 px-4 py-2 rounded-full gap-2 focus-within:ring-2 ring-primary/20 transition-all flex-grow max-w-md">
              <span className="material-symbols-outlined text-on-surface-variant dark:text-zinc-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none text-on-surface dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined p-2 text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 rounded-full transition-colors">
              notifications
            </button>
            
            <Link href="/settings" className="material-symbols-outlined p-2 text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 rounded-full transition-colors">
              settings
            </Link>

            {/* Profile Picture */}
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant dark:border-zinc-700 flex items-center justify-center bg-primary-container text-on-primary-container text-[11px] font-bold">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User profile" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout containing Sidebar + children page content */}
      <main className="flex flex-1 w-full overflow-hidden pb-16 md:pb-0">
        {/* SideNavBar (Visible on lg screens) */}
        <aside className="hidden lg:flex flex-col gap-base p-6 border-r border-outline-variant dark:border-zinc-800 bg-surface-container-lowest dark:bg-zinc-950 w-64 shrink-0 h-full overflow-y-auto scrollbar-hide">
          
          
          <div className="flex flex-col gap-2 flex-grow">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 dark:bg-zinc-800 text-blue-900 dark:text-white font-semibold active:scale-95 shadow-sm"
                      : "text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container dark:hover:bg-zinc-900 hover:translate-x-1"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-outline-variant dark:border-zinc-800">
            <Link
              href="/habits/new"
              className="w-full bg-primary dark:bg-zinc-100 text-on-primary dark:text-zinc-900 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 mb-4 hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New Habit</span>
            </Link>
            
            <div className="flex flex-col gap-1">
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant dark:text-zinc-400 text-body-sm hover:text-on-surface dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">help</span>
                <span>Help</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant dark:text-zinc-400 text-body-sm hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="text-left">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Canvas wrapper */}
        <div className="flex-1 h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-zinc-950 border-t border-outline-variant/30 dark:border-zinc-800 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/dashboard" ? "text-primary dark:text-white font-semibold" : "text-on-surface-variant dark:text-zinc-400"}`}
        >
          <span className="material-symbols-outlined" style={pathname === "/dashboard" ? { fontVariationSettings: "'FILL' 1" } : undefined}>dashboard</span>
          <span className="text-label-md">Home</span>
        </Link>
        <Link
          href="/calendar"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/calendar" ? "text-primary dark:text-white font-semibold" : "text-on-surface-variant dark:text-zinc-400"}`}
        >
          <span className="material-symbols-outlined" style={pathname === "/calendar" ? { fontVariationSettings: "'FILL' 1" } : undefined}>calendar_month</span>
          <span className="text-label-md">Plan</span>
        </Link>
        
        {/* Floating action button */}
        <div className="relative -top-6">
          <Link
            href="/habits/new"
            className="w-12 h-12 bg-primary dark:bg-zinc-100 text-on-primary dark:text-zinc-900 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">add</span>
          </Link>
        </div>

        <Link
          href="/analytics"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/analytics" ? "text-primary dark:text-white font-semibold" : "text-on-surface-variant dark:text-zinc-400"}`}
        >
          <span className="material-symbols-outlined" style={pathname === "/analytics" ? { fontVariationSettings: "'FILL' 1" } : undefined}>insights</span>
          <span className="text-label-md">Stats</span>
        </Link>
        <Link
          href="/settings"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/settings" ? "text-primary dark:text-white font-semibold" : "text-on-surface-variant dark:text-zinc-400"}`}
        >
          <span className="material-symbols-outlined" style={pathname === "/settings" ? { fontVariationSettings: "'FILL' 1" } : undefined}>person</span>
          <span className="text-label-md">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
