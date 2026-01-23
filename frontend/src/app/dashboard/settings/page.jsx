'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to company settings by default
    router.push('/dashboard/settings/company');
  }, [router]);

  return null;
}
