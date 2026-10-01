import Hero from '../components/home/Hero.jsx';
import ServicesTeaser from '../components/home/ServicesTeaser.jsx';
import ExploreMoreSection from '../components/home/ExploreMoreSection.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Home() {
  useDocumentTitle('CoralSwift Technologies | Transforming Businesses Through Intelligent Digital Solutions');

  return (
    <>
      <Hero />
      <ServicesTeaser />
      <ExploreMoreSection />
      <TestimonialsSection />
      <WhyChooseUs />
      <CtaBanner />
    </>
  );
}


