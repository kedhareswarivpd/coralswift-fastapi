import { useEffect, useState } from 'react';
import AboutHero from '../components/about/AboutHero.jsx';
import MissionVision from '../components/about/MissionVision.jsx';
import ImpactStats from '../components/about/ImpactStats.jsx';
import ValuesGrid from '../components/about/ValuesGrid.jsx';
import Timeline from '../components/about/Timeline.jsx';
import LeadershipGrid from '../components/about/LeadershipGrid.jsx';
import DepartmentsGrid from '../components/about/DepartmentsGrid.jsx';
import GlobalPresence from '../components/about/GlobalPresence.jsx';
import Certifications from '../components/about/Certifications.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { getStats } from '../api/stats.js';

export default function About() {
 useDocumentTitle('About Us | CoralSwift Technologies');
 const [stats, setStats] = useState(null);

 useEffect(() => {
  getStats()
   .then((res) => setStats(res.data))
   .catch(() => setStats(null));
 }, []);

 return (
  <>
   <AboutHero stats={stats} />
   <ImpactStats />
   <MissionVision />
   <ValuesGrid />
   <Timeline />
   <LeadershipGrid />
   <DepartmentsGrid />
   <GlobalPresence />
   <Certifications />
  </>
 );
}
