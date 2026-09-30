import { useEffect, useState } from 'react';
import LegalContent from '../components/legal/LegalContent.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { termsOfService } from '../data/legal.js';
import { fetchPageContent } from '../api/cms.js';
import { adaptPageContent } from '../utils/legalContent.js';

export default function Terms() {
 useDocumentTitle('Terms of Service | CoralSwift Technologies');
 const [content, setContent] = useState(termsOfService);

 useEffect(() => {
  fetchPageContent('terms-of-service')
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
