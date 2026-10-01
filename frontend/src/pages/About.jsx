import AboutHero from '../components/about/AboutHero.jsx';
import ArchitecturePillars from '../components/about/ArchitecturePillars.jsx';
import JourneyMilestones from '../components/about/JourneyMilestones.jsx';
import CollaborateBanner from '../components/about/CollaborateBanner.jsx';
import DepartmentsGrid from '../components/about/DepartmentsGrid.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function About() {
  useDocumentTitle('About Us | CoralSwift Technologies');

  return (
    <>
      <AboutHero />
      <ArchitecturePillars />
      <JourneyMilestones />
      <CollaborateBanner />
      <DepartmentsGrid />
    </>
  );
}






