"use client";

import { AuthProvider } from "@/contexts/auth";
import { NextUIProvider } from "@nextui-org/react";
import { CollabProvider } from "@/contexts/collab";
import { HistoryProvider } from "@/contexts/history";
import { TopicProvider } from "./topic";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <AuthProvider>
        <TopicProvider>
          <CollabProvider>
            <HistoryProvider>{children}</HistoryProvider>
          </CollabProvider>
        </TopicProvider>
      </AuthProvider>
    </NextUIProvider>
  );
}
