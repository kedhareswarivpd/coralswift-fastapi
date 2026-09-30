import ServicesHero from '../components/services/ServicesHero.jsx';
import ServicesGrid from '../components/services/ServicesGrid.jsx';
import EngagementProcess from '../components/services/EngagementProcess.jsx';
import FaqAccordion from '../components/services/FaqAccordion.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Services() {
 useDocumentTitle('Our Technology Offerings | CoralSwift Technologies');

 return (
  <>
   <ServicesHero />
   <ServicesGrid />
   <EngagementProcess />
   <FaqAccordion />
  </>
 );
}
