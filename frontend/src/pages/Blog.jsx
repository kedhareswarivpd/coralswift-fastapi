import { useEffect, useState } from 'react';
import BlogHero from '../components/blog/BlogHero.jsx';
import BlogGrid from '../components/blog/BlogGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { apiRequest } from '../api/client.js';
import { posts as fallbackPosts, categories } from '../data/blog.js';

function adaptBlogPosts(apiPosts) {
 return apiPosts.map((p) => {
  let excerpt = p.excerpt || '';
  if (!excerpt && p.content) {
   excerpt = p.content.replace(/<[^>]+>/g, '').slice(0, 200).trim();
   if (excerpt.length === 200) excerpt += '...';
  }
  return {
   slug: p.slug,
   title: p.title,
   excerpt,
  author: p.author_name || 'CoralSwift Team',
  role: p.author_role || '',
  category: p.category_name || p.category || 'Uncategorized',
   publishedAt: p.published_at ? p.published_at.slice(0, 10) : '',
   readTime: p.read_time || `${Math.max(1, Math.ceil((p.content?.length || 0) / 2000))} min read`,
   tags: p.tags || [],
   image: p.cover_image || '',
   content: p.content || '',
  };
 });
}

export default function Blog() {
 useDocumentTitle('Blog | CoralSwift Technologies');
 const [posts, setPosts] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  apiRequest('/blogs?limit=20')
   .then((res) => {
    const adapted = adaptBlogPosts(res.data || []);
    // An empty (but successful) response means no posts are published yet —
    // fall back to the bundled demo dataset so the section isn't blank.
    setPosts(adapted.length ? adapted : fallbackPosts);
   })
   .catch(() => setPosts(fallbackPosts))
   .finally(() => setLoading(false));
 }, []);

 return (
  <>
   <BlogHero />
   <SectionHeading
    eyebrow="Latest Insights"
    title="Thought Leadership & Engineering Deep Dives"
    description="Practical knowledge and perspectives from our team of experts."
    align="center"
    className="mx-auto max-w-container px-4 pt-16 sm:px-6 lg:px-10 xl:px-12 "
   />
   {loading ? (
    <div className="py-8 text-center text-body-md text-ink-muted">Loading posts...</div>
   ) : (
    <BlogGrid posts={posts} categories={categories} />
   )}
   <CtaBanner />
  </>
 );
}
