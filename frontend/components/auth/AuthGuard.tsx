"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/portal", "/public"];

export interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/");
      }
    }
  }, [user, isLoading, pathname, isPublicRoute, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 min-h-screen bg-background flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    return (
      <div className="fixed inset-0 min-h-screen bg-background flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Redirigiendo a inicio de sesión...</p>
        </div>
      </div>
    );
  }

  if (user && pathname === "/login") {
    return (
      <div className="fixed inset-0 min-h-screen bg-background flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Redirigiendo al panel principal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
