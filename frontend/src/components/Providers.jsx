'use client';

import { AuthProvider as DescopeAuthProvider } from '@descope/react-sdk';
import { AuthProvider } from '../contexts/AuthContext';

export function Providers({ children }) {
  return (
    <DescopeAuthProvider projectId={process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID}>
      <AuthProvider>{children}</AuthProvider>
    </DescopeAuthProvider>
  );
}
