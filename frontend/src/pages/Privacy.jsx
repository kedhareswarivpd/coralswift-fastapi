import { useEffect, useState } from 'react';
import LegalContent from '../components/legal/LegalContent.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { privacyPolicy } from '../data/legal.js';
import { fetchPageContent } from '../api/cms.js';
import { adaptPageContent } from '../utils/legalContent.js';

export default function Privacy() {
 useDocumentTitle('Privacy Policy | CoralSwift Technologies');
 const [content, setContent] = useState(privacyPolicy);

 useEffect(() => {
  fetchPageContent('privacy-policy')
   .then((res) => {
    const item = res?.data?.[0];
    if (item) setContent(adaptPageContent(item));
   })
   .catch(() => {});
 }, []);

 return (
  <div className="pt-32">
   <LegalContent content={content} />
  </div>
 );
}
