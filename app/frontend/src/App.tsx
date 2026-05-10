import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import EngineeringServices from './pages/EngineeringServices';
import GovernmentServices from './pages/GovernmentServices';
import ContactCard from './pages/ContactCard';
import Services from './pages/Services';
import About from './pages/About';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Consultation from './pages/Consultation';
import Market from './pages/Market';
import Contact from './pages/Contact';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/engineering-services" element={<EngineeringServices />} />
    <Route path="/government-services" element={<GovernmentServices />} />
    <Route path="/contact-card" element={<ContactCard />} />
    <Route path="/services" element={<Services />} />
    <Route path="/about" element={<About />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/team" element={<Team />} />
    <Route path="/consultation" element={<Consultation />} />
    <Route path="/market" element={<Market />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };