"use client";

import { AuthProvider } from "@/contexts/auth";
import { NextUIProvider } from "@nextui-org/react";
import { TopicProvider } from "./topic";
import { HistoryProvider } from "./history";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <AuthProvider>
        <TopicProvider>
          <HistoryProvider>{children}</HistoryProvider>
        </TopicProvider>
      </AuthProvider>
    </NextUIProvider>
  );
}
