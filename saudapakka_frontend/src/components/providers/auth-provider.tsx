"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { checkUser } = useAuth();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // 1. Rehydrate the state from localStorage
                await useAuth.persist.rehydrate();

                // 2. Check for a valid session via API/Cookies
                await checkUser();
            } catch (error) {
                // Silently fail - if they aren't logged in, they aren't logged in.
                // We don't want to redirect from public pages.
                console.warn("Auth check failed:", error);
            } finally {
                setIsReady(true);
            }
        };

        initAuth();
    }, [checkUser]);

    // We render children immediately to avoid blocking the UI,
    // but the 'user' state will update asynchronously.
    return <>{children}</>;
}
