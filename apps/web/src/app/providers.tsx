import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  AuthProvider,
  type AuthUser,
} from '@/features/auth/auth-provider'

interface AppProvidersProps {
  children: ReactNode
  initialAuthUser?: AuthUser | null
}

function AppProviders({ children, initialAuthUser }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialAuthUser}>
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster theme="light" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export { AppProviders }
