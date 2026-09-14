import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

export default function PrerenderProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <EditModeProvider>
            <AuthProvider>{children}</AuthProvider>
          </EditModeProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
