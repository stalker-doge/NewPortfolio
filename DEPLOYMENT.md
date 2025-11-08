# Vercel Deployment Guide

This guide will help you deploy your portfolio website to Vercel with all optimizations and features enabled.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your portfolio should be pushed to GitHub
3. **Node.js**: Version 16.0.0 or higher

## Quick Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect the settings from `vercel.json`
5. Click "Deploy"

### 3. Deploy via CLI

```bash
# Clone your repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

## Environment Variables

### Required Environment Variables

In your Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `GITHUB_USERNAME` | `stalker-doge` | Your GitHub username |
| `GITHUB_REPO` | `NewPortfolio` | Your repository name |
| `REPO_BRANCH` | `main` | Your main branch name |
| `NODE_ENV` | `production` | Environment mode |

### Optional Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `ADMIN_PASSWORD` | `portfolio2024` | Admin panel password |
| `GOOGLE_ANALYTICS_ID` | `G-XXXXXXXXXX` | Google Analytics |
| `CUSTOM_DOMAIN` | `your-domain.com` | Custom domain |

### GitHub Token Configuration

For the admin CMS to work:

1. **Create GitHub Personal Access Token**:
   - Go to GitHub → Settings → Developer Settings → Personal Access Tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control of private repositories)
   - Generate and copy the token

2. **Add to Environment Variables**:
   - In Vercel dashboard, add `GITHUB_TOKEN` with your token value
   - This token is encrypted and secure

## Domain Configuration

### Custom Domain Setup

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain (e.g., `your-domain.com`)
3. Configure DNS records as shown in Vercel dashboard:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (usually 5-30 minutes)

### SSL Certificate

Vercel automatically provides:
- Free SSL certificates
- Automatic HTTPS redirection
- Certificate renewal

## Build Process

### What Happens During Build

1. **Install Dependencies**: `npm install`
2. **Optimize Assets**: Minify CSS and JavaScript
3. **Process Images**: Optimize and convert to WebP
4. **Create Distribution**: Copy files to `dist/` directory
5. **Deploy**: Upload to Vercel's global CDN

### Build Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Prepare for deployment
npm run prepare-deploy

# Optimize images
npm run optimize-images
```

## Performance Optimizations

### Automatic Optimizations

- **CDN Delivery**: Global edge network
- **Asset Compression**: Gzip/Brotli compression
- **Caching**: Intelligent cache headers
- **Image Optimization**: WebP format and lazy loading
- **Code Splitting**: Optimized JavaScript bundles

### Service Worker

The included service worker provides:
- **Offline Support**: Core functionality works offline
- **Background Updates**: Automatic content updates
- **Cache Management**: Intelligent caching strategy

## Monitoring and Analytics

### Vercel Analytics

1. In Vercel dashboard, go to **Analytics**
2. Enable Vercel Analytics
3. Add `VERCEL_ANALYTICS_ID` to environment variables if needed

### Google Analytics (Optional)

1. Create Google Analytics account
2. Get tracking ID (`G-XXXXXXXXXX`)
3. Add `GOOGLE_ANALYTICS_ID` to environment variables
4. Analytics will be automatically included

### Performance Monitoring

- **Core Web Vitals**: Automatically tracked
- **Page Load Times**: Real-time monitoring
- **Error Tracking**: JavaScript error reporting

## SEO Features

### Included SEO Optimizations

- **Meta Tags**: Comprehensive meta information
- **Structured Data**: JSON-LD schema for search engines
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Search engine instructions
- **Open Graph**: Social media sharing

### Search Engine Submission

Submit your sitemap to search engines:
- Google Search Console: `https://your-domain.com/sitemap.xml`
- Bing Webmaster Tools: `https://your-domain.com/sitemap.xml`

## Security Features

### Built-in Security

- **HTTPS**: Automatic SSL certificates
- **Security Headers**: X-Frame-Options, X-Content-Type-Options
- **CSP**: Content Security Policy
- **Rate Limiting**: Automatic DDoS protection

### Admin Panel Security

- **Password Protection**: Admin panel is password-protected
- **Token Security**: GitHub tokens stored securely
- **Input Validation**: XSS protection

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear build cache
rm -rf node_modules dist
npm install
npm run build
```

#### Environment Variables Not Working

1. Check variable names match exactly
2. Ensure variables are set in correct environment (Production vs Preview)
3. Redeploy after adding variables

#### GitHub API Issues

1. Verify GitHub token has `repo` scope
2. Check repository name and username
3. Ensure repository is accessible

#### Performance Issues

1. Check Core Web Vitals in Vercel Analytics
2. Verify images are optimized
3. Check for unused JavaScript

### Debug Mode

For debugging deployment issues:

```bash
# Enable debug logging
DEBUG=* vercel --prod
```

## Deployment Checklist

### Before Deploying

- [ ] Repository pushed to GitHub
- [ ] Environment variables configured
- [ ] GitHub token created and added
- [ ] Custom domain configured (if needed)
- [ ] Analytics tracking set up (if needed)

### After Deploying

- [ ] Test all pages load correctly
- [ ] Verify admin panel works
- [ ] Check GitHub API integration
- [ ] Test contact forms and links
- [ ] Verify SEO meta tags
- [ ] Check Core Web Vitals

## Maintenance

### Regular Tasks

- **Update Dependencies**: Monthly
- **Monitor Analytics**: Weekly
- **Check Core Web Vitals**: Monthly
- **Update Content**: As needed
- **Security Updates**: As released

### Backup Strategy

- **Git Repository**: Automatic version control
- **Vercel Snapshots**: Automatic deployments
- **GitHub Repository**: Code and content backup
- **Regular Exports**: Manual data backups

## Advanced Configuration

### Custom Build Commands

You can customize the build process in `vercel.json`:

```json
{
  "buildCommand": "npm run custom-build",
  "outputDirectory": "custom-dist",
  "installCommand": "npm ci"
}
```

### Edge Functions (Future)

For server-side functionality, you can add Edge Functions:

```javascript
// api/function.js
export default function handler(req, res) {
  // Server-side logic
}
```

### Environment-Specific Configs

```javascript
// Use environment variables in code
const isProduction = process.env.NODE_ENV === 'production';
const githubToken = process.env.GITHUB_TOKEN;
```

## Support

### Vercel Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Deployment Guide](https://vercel.com/docs/concepts/deployments)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Common Issues

- [Build Troubleshooting](https://vercel.com/docs/concepts/builds/troubleshooting)
- [Domain Configuration](https://vercel.com/docs/concepts/projects/custom-domains)
- [Performance](https://vercel.com/docs/concepts/analytics)

---

**Happy Deploying!** 🚀

Your portfolio is now optimized for Vercel with all modern web development best practices.
