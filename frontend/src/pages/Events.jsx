import { useEffect, useState } from 'react';
import EventsHero from '../components/events/EventsHero.jsx';
import EventsGrid from '../components/events/EventsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { events as staticEvents, eventTypeFilters } from '../data/events.js';
import { fetchEvents } from '../api/events.js';

function toFrontend(e) {
 return {
  slug: e.slug,
  title: e.title,
  description: e.description,
  date: e.start_date,
  time: e.end_date
   ? `${new Date(e.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(e.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
   : new Date(e.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  location: e.location || 'TBD',
  type: 'Conference',
  isVirtual: e.is_virtual,
  registrationUrl: e.registration_url || '#',
 };
}

export default function Events() {
 useDocumentTitle('Events | CoralSwift Technologies');
 const [events, setEvents] = useState(staticEvents);

 useEffect(() => {
  fetchEvents()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setEvents(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <EventsHero />
   <SectionHeading
    eyebrow="Upcoming Events"
    title="Join Us Around the World"
    description="From intimate workshops to industry conferences, discover opportunities to connect with our team."
    align="center"
    className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12 [&_h2]:!text-white [&_p]:!text-white"
   />
   <EventsGrid events={events} typeFilters={eventTypeFilters} />
   <CtaBanner />
  </>
 );
}
