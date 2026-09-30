import { useEffect, useState } from 'react';
import ProductsHero from '../components/products/ProductsHero.jsx';
import ProductsGrid from '../components/products/ProductsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { products as staticProducts } from '../data/products.js';
import { fetchProducts } from '../api/cms.js';

function toFrontend(p) {
 return {
  icon: p.icon || 'inventory_2',
  title: p.name,
  tagline: p.tagline || '',
  description: p.description || '',
  features: p.features || [],
  status: 'GA',
 };
}

export default function Products() {
 useDocumentTitle('Our Products | CoralSwift Technologies');
 const [products, setProducts] = useState(staticProducts);

 useEffect(() => {
  fetchProducts()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setProducts(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <ProductsHero />
   <SectionHeading
    eyebrow="Product Suite"
    title="Platforms Built for Enterprise"
    description="Battle-tested products that power analytics, security, integration, and DevOps for global organizations."
    align="center"
    className="mx-auto max-w-container px-4 pt-16 sm:px-6 lg:px-10 xl:px-12 [&_h2]:!text-white [&_p]:!text-white"
   />
   <ProductsGrid products={products} />
   <CtaBanner />
  </>
 );
}
