import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { monitor } from '@/lib/monitoring';
import { useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import FeedbackButton from '@/components/common/FeedbackButton';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import TopNav from './components/layout/TopNav';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadScraper from './pages/LeadScraper';
import Clients from './pages/Clients';
import EmailOutreach from './pages/EmailOutreach';
import Settings from './pages/Settings';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Security from './pages/Security';
import Compliance from './pages/Compliance';
import Unauthorized from './pages/Unauthorized';
import Blog from './pages/Blog';
import HelpCenter from './pages/HelpCenter';
import HelpArticle from './pages/HelpArticle';
import HelpCenterCategory from './pages/HelpCenterCategory';
import HelpArticles from './pages/HelpArticles';
import HelpFaqs from './pages/HelpFaqs';
import GettingStartedGuide from './pages/GettingStartedGuide';
import ContactUs from './pages/ContactUs';
import EmailSupport from './pages/EmailSupport';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Integrations from './pages/Integrations';
import IntegrationsPage from './pages/IntegrationsPage';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const { user, profile, loading, error } = useAuth();

  // Initialize analytics and monitoring
  useEffect(() => {
    analytics.init();
    
    if (user && profile) {
      analytics.identify(user.uid, {
        plan: profile.role,
        role: profile.role,
        company: profile.company,
        signupDate: profile.createdAt,
      });
    }
  }, [user, profile]);

  // Track page views
  useEffect(() => {
    analytics.page(window.location.pathname, document.title);
  }, [window.location.pathname]);

  // Update document title
  useEffect(() => {
    document.title = APP_INFO.name;
    
    // Set favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = APP_INFO.faviconUrl;
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading {APP_INFO.name}...</p>
          <p className="text-xs text-gray-400 mt-2">
            Demo credentials: demo@clientflow.com / demo123
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <LoginForm />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/dashboard" replace /> : <SignUpForm />
          } />
          
          {/* Blog */}
          <Route path="/blog" element={<Blog />} />
          
          {/* Help Center */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/article/:articleId" element={<HelpArticle />} />
          <Route path="/help/category/:categoryId" element={<HelpCenterCategory />} />
          <Route path="/help/articles" element={<HelpArticles />} />
          <Route path="/help/faqs" element={<HelpFaqs />} />
          <Route path="/help/getting-started" element={<GettingStartedGuide />} />
          
          {/* Support */}
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/email-support" element={<EmailSupport />} />
          
          {/* Legal pages */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/compliance" element={<Compliance />} />
          
          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Payment result pages - these need auth but different layout */}
          <Route path="/success" element={
            <AuthGuard>
              <Success />
            </AuthGuard>
          } />
          <Route path="/cancel" element={
            <AuthGuard>
              <Cancel />
            </AuthGuard>
          } />

          {/* Protected routes with main layout */}
          <Route path="/*" element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          } />
        </Routes>
        <Toaster />
        <FeedbackButton />
      </div>
    </ErrorBoundary>
  );
}

// Separate component for the main layout
function MainLayout() {
  return (
    <div className="main-content">
      <TopNav />
      <div className="content-area">
        <main className="scrollable-content">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/lead-scraper" element={<LeadScraper />} />
                <Route path="/email-outreach" element={<EmailOutreach />} />
                <Route path="/clients" element={
                  <AuthGuard requiredRole={['admin', 'closer', 'agent']}>
                    <Clients />
                  </AuthGuard>
                } />
                <Route path="/settings" element={<Settings />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/integrations-page" element={<IntegrationsPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AuthGuard requiredRole={['admin']}>
                    <AdminDashboard />
                  </AuthGuard>
                } />
                <Route path="/admin/users" element={
                  <AuthGuard requiredRole={['admin']}>
                    <UserManagement />
                  </AuthGuard>
                } />
                <Route path="/admin/leads" element={
                  <AuthGuard requiredRole={['admin']}>
                    <div className="p-6">
                      <h1 className="text-3xl font-bold">Lead Management</h1>
                      <p className="text-gray-600 mt-2">Admin view of all leads across the platform</p>
                      <div className="mt-8 text-center text-gray-500">
                        <p>Lead management interface would be implemented here</p>
                      </div>
                    </div>
                  </AuthGuard>
                } />
                <Route path="/admin/logs" element={
                  <AuthGuard requiredRole={['admin']}>
                    <div className="p-6">
                      <h1 className="text-3xl font-bold">System Logs</h1>
                      <p className="text-gray-600 mt-2">View system activity and audit logs</p>
                      <div className="mt-8 text-center text-gray-500">
                        <p>System logs interface would be implemented here</p>
                      </div>
                    </div>
                  </AuthGuard>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;