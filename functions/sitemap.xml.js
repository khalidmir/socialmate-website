export async function onRequest(context) {
  try {
    const baseUrl = 'https://socialmate.org';

    // Fetch with timeout to prevent Cloudflare Functions from timing out
    const fetchWithTimeout = (url, timeout = 10000) => {
      return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Fetch timeout')), timeout)
        )
      ]);
    };

    const blogPostsResponse = await fetchWithTimeout(`${baseUrl}/blog-posts.json`);
    const jobsResponse = await fetchWithTimeout(`${baseUrl}/jobs-openings.json`);

    if (!blogPostsResponse.ok || !jobsResponse.ok) {
      console.error('Failed to fetch data files', {
        blog: blogPostsResponse.status,
        jobs: jobsResponse.status
      });
      return new Response('Data files not found', { status: 404 });
    }

    const blogPosts = await blogPostsResponse.json();
    const jobs = await jobsResponse.json();

    // Static pages configuration
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: '2026-10-10' },
      { loc: '/events.html', priority: '0.95', changefreq: 'weekly', lastmod: '2026-10-10' },
      { loc: '/networking.html', priority: '0.9', changefreq: 'weekly', lastmod: '2026-10-10' },
      { loc: '/services.html', priority: '0.85', changefreq: 'monthly', lastmod: '2026-10-10' },
      { loc: '/about.html', priority: '0.8', changefreq: 'monthly', lastmod: '2026-10-10' },
      { loc: '/contact.html', priority: '0.8', changefreq: 'monthly', lastmod: '2026-10-10' },
      { loc: '/blog.html', priority: '0.85', changefreq: 'weekly', lastmod: '2026-10-10' },
      { loc: '/careers.html', priority: '0.85', changefreq: 'weekly', lastmod: '2026-10-10' },
      { loc: '/privacy.html', priority: '0.5', changefreq: 'yearly', lastmod: '2026-10-10' },
      { loc: '/terms.html', priority: '0.5', changefreq: 'yearly', lastmod: '2026-10-10' },
      { loc: '/cookies.html', priority: '0.5', changefreq: 'yearly', lastmod: '2026-10-10' }
    ];

    // Generate blog post URLs
    const blogUrls = blogPosts.map(post => ({
      loc: `/blog/${post.slug}.html`,
      priority: post.featured ? '0.85' : '0.75',
      changefreq: 'monthly',
      lastmod: post.date
    }));

    // Generate job URLs
    const jobUrls = jobs.map(job => ({
      loc: `/jobs/${job.id}.html`,
      priority: job.featured ? '0.8' : '0.75',
      changefreq: 'weekly',
      lastmod: job.postedDate
    }));

    // Combine all URLs
    const allUrls = [...staticPages, ...blogUrls, ...jobUrls];

    // Generate XML sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>https://socialmate.org${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
