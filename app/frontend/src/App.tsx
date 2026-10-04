import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
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
import ServicesSectorPlatformsPage from './pages/ServicesSectorPlatformsPage';
import About from './pages/About';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Consultation from './pages/Consultation';
import Market from './pages/Market';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Invest from './pages/Invest';
import AuthCallback from '@/features/auth/pages/AuthCallback';
import AuthEntryPage from '@/features/auth/pages/AuthEntryPage';
import AuthError from '@/features/auth/pages/AuthError';
import LogoutCallbackPage from './pages/LogoutCallbackPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerWorkspace from './pages/CustomerWorkspace';
import ServiceRequestDetail from './pages/ServiceRequestDetail';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import ProtectedCommandCenterRoute from '@/components/ProtectedCommandCenterRoute';
import ProfessionalReviewPage from './pages/ProfessionalReview';
import OwnerCommandCenterPage from './pages/OwnerCommandCenter';
import PartnerPortalPage from './pages/PartnerPortal';
import ProtectedPartnerRoute from '@/components/ProtectedPartnerRoute';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import NotFoundPage from './pages/NotFoundPage';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import { JourneyRoute, journeyRouteElements } from '@/features/journeys/journeyRoutes';
import SectorPage from './pages/SectorPage';
import BlogRoutes from './blog-routes';
import { JourneyProvider } from '@/features/journeys/core/JourneyContext';
import GlobalAssistantDock from '@/components/GlobalAssistantDock';
import { WorkspaceProvider } from '@/features/ai-workspace/WorkspaceContext';

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
    <Route path="/services/platforms" element={<ServicesSectorPlatformsPage />} />
    <Route path="/services" element={<Services />} />
    <Route path="/about" element={<About />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/team" element={<Team />} />
    <Route path="/consultation" element={<Consultation />} />
    <Route path="/market" element={<Market />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/careers" element={<Careers />} />
    <Route path="/invest" element={<Invest />} />
    <Route path="/login" element={<AuthEntryPage mode="login" />} />
    <Route path="/register" element={<AuthEntryPage mode="register" />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    <Route path="/auth/logout-callback" element={<LogoutCallbackPage />} />
    <Route
      path="/payment/success"
      element={
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payment/cancel"
      element={
        <ProtectedRoute>
          <PaymentCancel />
        </ProtectedRoute>
      }
    />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route
      path="/command-center"
      element={
        <ProtectedCommandCenterRoute>
          <OwnerCommandCenterPage />
        </ProtectedCommandCenterRoute>
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
    {journeyRouteElements}
    <Route path="/sectors/:slug" element={<SectorPage />} />
    <Route
      path="/partner"
      element={
        <ProtectedPartnerRoute>
          <PartnerPortalPage />
        </ProtectedPartnerRoute>
      }
    />
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
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <LanguageProvider>
              <JourneyProvider>
                <EditModeProvider>
                  <WorkspaceProvider>
                    <AppErrorBoundary>
                      <Toaster />
                      <AppRoutes />
                      <GlobalAssistantDock />
                    </AppErrorBoundary>
                  </WorkspaceProvider>
                </EditModeProvider>
              </JourneyProvider>
            </LanguageProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };