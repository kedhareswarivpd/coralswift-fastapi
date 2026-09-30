import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { employeePortalPaths } from './data/portal.js';
import CookieConsent from './components/ui/CookieConsent.jsx';
import usePageViewTracker from './hooks/usePageViewTracker.js';
import { lazyWithReload as lazy } from './utils/lazyWithReload.js';

// Route-level code splitting — each page is fetched only when visited, so the
// initial bundle stays small and the app paints fast. lazyWithReload wraps
// React.lazy so that a stale browser tab (loaded before a deploy changed the
// chunk hashes) recovers with a single hard reload instead of showing a
// permanently broken "Failed to fetch dynamically imported module" error.
const Home = lazy(() => import('./pages/Home.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const SuccessStory = lazy(() => import('./pages/SuccessStory.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Solutions = lazy(() => import('./pages/Solutions.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const Technologies = lazy(() => import('./pages/Technologies.jsx'));
const Industries = lazy(() => import('./pages/Industries.jsx'));
const CaseStudies = lazy(() => import('./pages/CaseStudies.jsx'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail.jsx'));
const Careers = lazy(() => import('./pages/Careers.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogDetail = lazy(() => import('./pages/BlogDetail.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Awards = lazy(() => import('./pages/Awards.jsx'));
const Downloads = lazy(() => import('./pages/Downloads.jsx'));
const Resources = lazy(() => import('./pages/Resources.jsx'));
const Faq = lazy(() => import('./pages/Faq.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Cookies = lazy(() => import('./pages/Cookies.jsx'));
const ClientPortal = lazy(() => import('./pages/ClientPortal.jsx'));
const PartnerPortal = lazy(() => import('./pages/PartnerPortal.jsx'));
const EmployeePortal = lazy(() => import('./pages/EmployeePortal.jsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'));
const SuperAdminPanel = lazy(() => import('./pages/SuperAdminPanel.jsx'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const VerifyMfa = lazy(() => import('./pages/VerifyMfa.jsx'));
const BrochurePage = lazy(() => import('./pages/BrochurePage.jsx'));
const DownloadDetail = lazy(() => import('./pages/DownloadDetail.jsx'));

function PageFallback() {
 return (
  <div className="flex min-h-screen items-center justify-center bg-surface-white py-section-padding dark:bg-dark-surface">
   <LoadingSpinner />
  </div>
 );
}

export default function App() {
 usePageViewTracker();
 return (
  <>
   <ErrorBoundary>
   <Suspense fallback={<PageFallback />}>
    <Routes>
     <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="services" element={<ErrorBoundary pageName="Services"><Services /></ErrorBoundary>} />
      <Route path="services/:slug" element={<ErrorBoundary pageName="Service"><ServiceDetail /></ErrorBoundary>} />
      <Route path="portfolio" element={<ErrorBoundary pageName="Portfolio"><Portfolio /></ErrorBoundary>} />
      <Route path="portfolio/success/:slug" element={<ErrorBoundary pageName="Success Story"><SuccessStory /></ErrorBoundary>} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="solutions" element={<ErrorBoundary pageName="Solutions"><Solutions /></ErrorBoundary>} />
      <Route path="products" element={<ErrorBoundary pageName="Products"><Products /></ErrorBoundary>} />
      <Route path="technologies" element={<Technologies />} />
      <Route path="industries" element={<Industries />} />
      <Route path="case-studies" element={<ErrorBoundary pageName="Case Studies"><CaseStudies /></ErrorBoundary>} />
      <Route path="case-studies/:slug" element={<ErrorBoundary pageName="Case Study"><CaseStudyDetail /></ErrorBoundary>} />
      <Route path="careers" element={<Careers />} />
      <Route path="blog" element={<ErrorBoundary pageName="Blog"><Blog /></ErrorBoundary>} />
      <Route path="blog/:slug" element={<ErrorBoundary pageName="Blog Post"><BlogDetail /></ErrorBoundary>} />
      <Route path="events" element={<ErrorBoundary pageName="Events"><Events /></ErrorBoundary>} />
      <Route path="gallery" element={<ErrorBoundary pageName="Gallery"><Gallery /></ErrorBoundary>} />
      <Route path="awards" element={<ErrorBoundary pageName="Awards"><Awards /></ErrorBoundary>} />
      <Route path="downloads" element={<ErrorBoundary pageName="Downloads"><Downloads /></ErrorBoundary>} />
      <Route path="resources" element={<ErrorBoundary pageName="Resources"><Resources /></ErrorBoundary>} />
      <Route path="faq" element={<Faq />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="terms" element={<Terms />} />
      <Route path="cookies" element={<Cookies />} />
      <Route path="client" element={<ErrorBoundary pageName="Client Portal"><ClientPortal /></ErrorBoundary>} />
      <Route path="partner" element={<ErrorBoundary pageName="Partner Portal"><PartnerPortal /></ErrorBoundary>} />
      {employeePortalPaths.map((portalPath) => (
       <Route
        key={portalPath}
        path={portalPath}
        element={<ErrorBoundary pageName="Employee Portal"><EmployeePortal /></ErrorBoundary>}
       />
      ))}
      <Route path="admin" element={<ErrorBoundary pageName="Admin Panel"><AdminPanel /></ErrorBoundary>} />
      <Route path="super-admin" element={<ErrorBoundary pageName="Super Admin Panel"><SuperAdminPanel /></ErrorBoundary>} />
      <Route path="super-admin/login" element={<SuperAdminLogin />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="verify-mfa" element={<VerifyMfa />} />
      <Route path="brochure" element={<BrochurePage />} />
      <Route path="download/:slug" element={<ErrorBoundary pageName="Download"><DownloadDetail /></ErrorBoundary>} />
      <Route path="*" element={<NotFound />} />
     </Route>
    </Routes>
   </Suspense>
   </ErrorBoundary>
   <CookieConsent />
  </>
 );
}