"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import OnboardingTutorialModal from "@/components/onboarding/OnboardingTutorialModal";
import { cn } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/public" ||
    pathname.startsWith("/public/");

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex w-full">
      {!isPublicRoute && <Sidebar />}
      {!isPublicRoute && <OnboardingTutorialModal />}
      <main
        className={cn(
          "flex-1 w-full",
          isPublicRoute ? "p-0 min-h-screen" : "p-6 md:p-8 max-w-[1400px] mx-auto"
        )}
      >
        {children}
      </main>
    </div>
  );
}
