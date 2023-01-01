"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/stores/settings';

export function PlatformGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (!settings.platformEnabled && router.pathname !== '/maintenance') {
      router.push('/maintenance');
    }
  }, [settings.platformEnabled, router]);

  if (!settings.platformEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Plataforma Offline</h1>
          <p className="text-lg text-muted-foreground">
            {settings.disabledMessage}
          </p>
        </div>
      </div>
    );
  }

  return children;
}