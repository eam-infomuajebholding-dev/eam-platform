import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
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
import Careers from './pages/Careers';
import Invest from './pages/Invest';
import AuthCallback from '@/features/auth/pages/AuthCallback';
import AuthError from '@/features/auth/pages/AuthError';
import AdminDashboard from './pages/AdminDashboard';
import CustomerWorkspace from './pages/CustomerWorkspace';
import ServiceRequestDetail from './pages/ServiceRequestDetail';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import ProfessionalReviewPage from './pages/ProfessionalReview';
import OwnerCommandCenterPage from './pages/OwnerCommandCenter';
import BuildVillaJourneyPage from '@/features/journeys/build-villa/BuildVillaJourneyPage';
import EngineeringConsultingJourneyPage from '@/features/journeys/engineering-consulting/EngineeringConsultingJourneyPage';
import ContractingJourneyPage from '@/features/journeys/contracting/ContractingJourneyPage';
import RealEstateValuationJourneyPage from '@/features/journeys/real-estate-valuation/RealEstateValuationJourneyPage';
import SmartMaintenanceJourneyPage from '@/features/journeys/smart-maintenance/SmartMaintenanceJourneyPage';
import ProjectManagementJourneyPage from '@/features/journeys/project-management/ProjectManagementJourneyPage';
import FurnishingJourneyPage from '@/features/journeys/furnishing/FurnishingJourneyPage';
import FacilityManagementJourneyPage from '@/features/journeys/facility-management/FacilityManagementJourneyPage';
import GovernmentServicesJourneyPage from '@/features/journeys/government-services/GovernmentServicesJourneyPage';
import RealEstateDevelopmentJourneyPage from '@/features/journeys/real-estate-development/RealEstateDevelopmentJourneyPage';
import RealEstateMarketingJourneyPage from '@/features/journeys/real-estate-marketing/RealEstateMarketingJourneyPage';
import SectorPage from './pages/SectorPage';
import BlogRoutes from './blog-routes';
import { JourneyProvider } from '@/features/journeys/core/JourneyContext';

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
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route
      path="/command-center"
      element={
        <ProtectedAdminRoute>
          <OwnerCommandCenterPage />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/operations/service-requests"
      element={
        <ProtectedAdminRoute>
          <ProfessionalReviewPage />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/operations/service-requests/:id"
      element={
        <ProtectedAdminRoute>
          <ProfessionalReviewPage />
        </ProtectedAdminRoute>
      }
    />
    <Route path="/blog/*" element={<BlogRoutes />} />
    <Route path="/journeys/build-villa" element={<BuildVillaJourneyPage />} />
    <Route path="/journeys/engineering-consulting" element={<EngineeringConsultingJourneyPage />} />
    <Route path="/journeys/contracting" element={<ContractingJourneyPage />} />
    <Route path="/journeys/real-estate-valuation" element={<RealEstateValuationJourneyPage />} />
    <Route path="/journeys/smart-maintenance" element={<SmartMaintenanceJourneyPage />} />
    <Route path="/journeys/project-management" element={<ProjectManagementJourneyPage />} />
    <Route path="/journeys/furnishing" element={<FurnishingJourneyPage />} />
    <Route path="/journeys/facility-management" element={<FacilityManagementJourneyPage />} />
    <Route path="/journeys/government-services" element={<GovernmentServicesJourneyPage />} />
    <Route path="/journeys/real-estate-development" element={<RealEstateDevelopmentJourneyPage />} />
    <Route path="/journeys/real-estate-marketing" element={<RealEstateMarketingJourneyPage />} />
    <Route path="/sectors/:slug" element={<SectorPage />} />
    <Route
      path="/my-requests"
      element={
        <ProtectedRoute>
          <CustomerWorkspace />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-requests/:id"
      element={
        <ProtectedRoute>
          <ServiceRequestDetail />
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <JourneyProvider>
              <EditModeProvider>
                <Toaster />
                <AppRoutes />
              </EditModeProvider>
            </JourneyProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };