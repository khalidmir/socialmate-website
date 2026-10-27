// Dynamic XML sitemap for socialmate.org.
// Core pages come from STATIC_PAGES. Blog posts and job listings are read from
// the data files on every build, so new entries appear without editing this file.
// If a data file cannot be read, the sitemap still serves the core pages.

const SITE = 'https://socialmate.org';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: '2026-10-27' },
  { loc: '/events.html', priority: '0.95', changefreq: 'weekly', lastmod: '2026-10-27' },
  { loc: '/networking.html', priority: '0.9', changefreq: 'weekly', lastmod: '2026-10-27' },
  { loc: '/services.html', priority: '0.85', changefreq: 'monthly', lastmod: '2026-10-27' },
  { loc: '/blog.html', priority: '0.85', changefreq: 'weekly', lastmod: '2026-10-27' },
  { loc: '/careers.html', priority: '0.9', changefreq: 'weekly', lastmod: '2026-10-27' },
  { loc: '/about.html', priority: '0.8', changefreq: 'monthly', lastmod: '2026-10-27' },
  { loc: '/contact.html', priority: '0.8', changefreq: 'monthly', lastmod: '2026-10-27' },
  { loc: '/privacy.html', priority: '0.5', changefreq: 'yearly', lastmod: '2026-10-27' },
  { loc: '/terms.html', priority: '0.5', changefreq: 'yearly', lastmod: '2026-10-27' },
  { loc: '/cookies.html', priority: '0.5', changefreq: 'yearly', lastmod: '2026-10-27' }
];

// Reads a static data file from the same deployment. Uses the assets binding when
// present, so the request never leaves Cloudflare.
async function readDataFile(context, path) {
  const url = new URL(path, context.request.url);
  const response = context.env.ASSETS
    ? await context.env.ASSETS.fetch(url)
    : await fetch(url);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

// Keeps only valid YYYY-MM-DD dates, so a bad data entry cannot break the XML.
function safeDate(value, fallback) {
  return typeof value === 'string' && DATE_PATTERN.test(value) ? value : fallback;
}

// Data files store the flag as the string 'True' or 'False', so compare the text.
function isFeatured(value) {
  return value === true || String(value).toLowerCase() === 'true';
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function blogEntries(posts) {
  return posts
    .filter(post => post && post.slug)
    .map(post => ({
      loc: `/blog/${post.slug}.html`,
      priority: isFeatured(post.featured) ? '0.85' : '0.75',
      changefreq: 'monthly',
      lastmod: safeDate(post.date, '2026-10-01')
    }));
}

function jobEntries(jobs) {
  return jobs
    .filter(job => job && job.id)
    .map(job => ({
      loc: `/jobs/${job.id}.html`,
      priority: job.featured ? '0.8' : '0.75',
      changefreq: 'weekly',
      lastmod: safeDate(job.postedDate, '2026-10-01')
    }));
}

function renderXml(entries) {
  const urls = entries.map(entry => `  <url>
    <loc>${escapeXml(SITE + entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export async function onRequest(context) {
  const [postsResult, jobsResult] = await Promise.allSettled([
    readDataFile(context, '/blog-posts.json'),
    readDataFile(context, '/jobs-openings.json')
  ]);

  const entries = [...STATIC_PAGES];

  if (postsResult.status === 'fulfilled' && Array.isArray(postsResult.value)) {
    entries.push(...blogEntries(postsResult.value));
  } else {
    console.error('Sitemap: blog data unavailable', postsResult.reason);
  }

  if (jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value)) {
    entries.push(...jobEntries(jobsResult.value));
  } else {
    console.error('Sitemap: job data unavailable', jobsResult.reason);
  }

  return new Response(renderXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
