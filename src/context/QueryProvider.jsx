"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Enterprise TanStack Query Cache Provider
 * Configured with long stale times to prevent flickering during live presentations
 * and seamless background updates via real-time Firebase/LocalStorage listeners.
 */
export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
            gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
            refetchOnWindowFocus: false, // Prevents sudden UI blinks during screen shares
            refetchOnReconnect: true,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
