import { useEffect, useState } from 'react';
import Hero from '../components/home/Hero.jsx';
import StatsBar from '../components/home/StatsBar.jsx';
import AboutTeaser from '../components/home/AboutTeaser.jsx';
import ServicesTeaser from '../components/home/ServicesTeaser.jsx';
import ExploreMoreSection from '../components/home/ExploreMoreSection.jsx';
import PortfolioTeaser from '../components/home/PortfolioTeaser.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import PartnersStrip from '../components/home/PartnersStrip.jsx';
import AwardsTeaser from '../components/home/AwardsTeaser.jsx';
import BlogTeaser from '../components/home/BlogTeaser.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import NewsletterSignup from '../components/home/NewsletterSignup.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { getStats } from '../api/stats.js';

export default function Home() {
 useDocumentTitle('CoralSwift Technologies | Transforming Businesses Through Intelligent Digital Solutions');
 const [stats, setStats] = useState(null);

 useEffect(() => {
  getStats()
   .then((res) => setStats(res?.data ?? null))
   .catch(() => {});
 }, []);

 return (
  <>
   <Hero />
   <StatsBar stats={stats} />
   <AboutTeaser />
   <ServicesTeaser />
   <ExploreMoreSection />
   <PortfolioTeaser />
   {/* Testimonials doubles as the "Clients" section — it already surfaces
     real client/company names; a separate client-logo strip would need
     a dedicated CMS resource the backend doesn't have. */}
   <TestimonialsSection />
   <PartnersStrip />
   <AwardsTeaser />
   <BlogTeaser />
   <WhyChooseUs />
   <NewsletterSignup />
   <CtaBanner />
  </>
 );
}
