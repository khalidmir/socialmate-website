# Deployment Instructions for Social Mate Events UAE

## Cloudflare Pages Deployment

This website is deployed to Cloudflare Pages on the KreativeMinds CF account (d8ac64).

### Domain
- **Production:** https://socialmate.org
- **CF Pages Project:** (to be created)

### Prerequisites

1. Git repository initialized
2. Access to KreativeMinds CF account (d8ac64)
3. CF_TOKEN_SM or equivalent Cloudflare API token

### Deployment Steps

#### Option 1: Git Integration (Recommended)

1. **Create GitHub Repository**
   ```bash
   cd /path/to/SocialMate
   git init
   git add .
   git commit -m "Initial commit: Social Mate Events UAE website"
   git branch -M main
   git remote add origin https://github.com/YOUR_ORG/SocialMate.git
   git push -u origin main
   ```

2. **Set Up CF Pages Project**
   - Go to Cloudflare Dashboard → Pages
   - Create new project
   - Connect GitHub repository
   - Set build configuration:
     - Framework: None (static)
     - Build command: (leave empty)
     - Build output directory: /
   - Add custom domain: socialmate.org
   - Deploy

3. **Enable Auto-Deploy**
   - Every push to main branch = automatic deployment
   - Verify at https://socialmate.org

#### Option 2: Direct Wrangler Deployment

```bash
# Ensure wrangler is installed
npm install -g @wrangler/cli

# Set environment variables
export CF_API_TOKEN=<your_cf_api_token>
export CF_ACCOUNT_ID=d8ac64aacf6579f90ba1a98393b2444e

# Deploy using wrangler
wrangler pages deploy . --project-name=socialmate --production

# Or deploy without production flag for preview
wrangler pages deploy .
```

### Important Notes

1. **No Build Process Needed** - This is a static HTML site with no build step
2. **Clean URLs** - CF Pages may handle .html → clean URL routing via settings
3. **CNAME Configuration** - Domain must be added in CF Pages project settings
4. **SSL/TLS** - Automatic with Cloudflare

### Post-Deployment Verification

1. Check https://socialmate.org loads correctly
2. Test all navigation links
3. Verify form submission works
4. Check sitemap at https://socialmate.org/sitemap.xml
5. Test robots.txt at https://socialmate.org/robots.txt
6. Verify favicon loads
7. Check mobile responsiveness
8. Test on different browsers

### Troubleshooting

**Issue:** Site shows 404 or 500 error
- Clear Cloudflare cache
- Check _redirects file is correct
- Verify all files deployed correctly

**Issue:** Images not loading
- Check asset paths are correct
- Verify images are in assets/ directory
- Ensure MIME types are correct

**Issue:** Forms not working
- Verify FormSubmit endpoint is correct
- Check CORS headers (if applicable)
- Test in browser DevTools

### Updating the Site

1. Make changes locally
2. Test changes (open index.html in browser)
3. Commit changes:
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push origin main
   ```
4. Wait for CF Pages to auto-deploy (1-2 minutes)
5. Verify changes at https://socialmate.org

### Images & Assets

- Place all images in `assets/images/` folder
- Optimize before uploading:
  - JPG: 1200x800px, 100-150KB
  - PNG: 1200x800px, 200-300KB
  - Use tools like TinyPNG or ImageOptim

### SEO Checklist

- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt accessible
- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] JSON-LD schema valid
- [ ] Mobile friendly test passed
- [ ] Page speed optimized

### Contact & Support

For deployment questions or issues:
- Email: hello@socialmate.org
- Cloudflare Dashboard: https://dash.cloudflare.com/
- CF Account ID: d8ac64aacf6579f90ba1a98393b2444e
