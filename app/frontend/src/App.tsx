import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ContentProvider } from '@/components/ContentProvider';
import Index from './pages/Index';
import EngineeringServices from './pages/EngineeringServices';
import GovernmentServices from './pages/GovernmentServices';
import ContractingServices from './pages/ContractingServices';
import MaintenanceServices from './pages/MaintenanceServices';
import RealEstateDevelopment from './pages/RealEstateDevelopment';
import RealEstateMarketing from './pages/RealEstateMarketing';
import ContactCard from './pages/ContactCard';
import Services from './pages/Services';
import About from './pages/About';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Consultation from './pages/Consultation';
import Market from './pages/Market';
import Contact from './pages/Contact';
import { ContentProvider } from '@/components/ContentProvider';
import Careers from './pages/Careers';
import Invest from './pages/Invest';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/engineering-services" element={<EngineeringServices />} />
    <Route path="/government-services" element={<GovernmentServices />} />
    <Route path="/services/contracting" element={<ContractingServices />} />
    <Route path="/services/maintenance" element={<MaintenanceServices />} />
    <Route path="/services/real-estate-development" element={<RealEstateDevelopment />} />
    <Route path="/services/real-estate-marketing" element={<RealEstateMarketing />} />
    <Route path="/contact-card" element={<ContactCard />} />
    <Route path="/services" element={<Services />} />
    <Route path="/about" element={<About />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/team" element={<Team />} />
    <Route path="/consultation" element={<Consultation />} />
    <Route path="/market" element={<Market />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/careers" element={<Careers />} />
    <Route path="/invest" element={<Invest />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <ContentProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ContentProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };