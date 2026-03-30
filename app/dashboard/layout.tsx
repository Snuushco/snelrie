"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  User,
  CreditCard,
  LogOut,
  Menu,
  X,
  Palette,
  Shield,
  Key,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overzicht", icon: LayoutDashboard },
  { href: "/dashboard/rapporten", label: "Rapporten", icon: FileText },
  { href: "/dashboard/compliance", label: "Compliance", icon: Shield },
  { href: "/dashboard/account", label: "Account", icon: User },
  { href: "/dashboard/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/dashboard/branding", label: "Branding", icon: Palette },
  { href: "/dashboard/instellingen/api", label: "API-sleutels", icon: Key },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">
          Snel<span className="text-blue-600">RIE</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100 hidden lg:block">
              <Link href="/" className="text-2xl font-bold">
                Snel<span className="text-blue-600">RIE</span>
              </Link>
            </div>

            {/* User info */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.naam || session?.user?.name || "Gebruiker"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition w-full"
              >
                <LogOut className="w-5 h-5" />
                Uitloggen
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
