# 🚢 Deployment Guide

Complete guide to deploying your Planning Poker app to production.

## Table of Contents

- [Deploy to Vercel (Recommended)](#deploy-to-vercel)
- [Deploy to Netlify](#deploy-to-netlify)
- [Deploy to Railway](#deploy-to-railway)
- [Self-Hosted Deployment](#self-hosted)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Deploy to Vercel

Vercel is the recommended platform for Next.js apps (created by the Next.js team).

### Option 1: Deploy Button (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/planningpokeronlineforfree)

Click the button above and follow the prompts.

### Option 2: Manual Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/planningpokeronlineforfree.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...your-key
     ```
   - Apply to: **Production**, **Preview**, **Development**

4. **Deploy**
   - Click **"Deploy"**
   - Wait ~2 minutes
   - Your app is live! 🎉

### Vercel Configuration

The project includes a `vercel.json` for optimal settings.

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `poker.yourdomain.com`)
3. Update DNS records as instructed
4. SSL is automatic!

## Deploy to Netlify

1. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Environment Variables**
   - Settings → Build & Deploy → Environment
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   - Connect your GitHub repo
   - Netlify will auto-deploy on push

## Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login & Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Self-Hosted

### Using PM2 (Process Manager)

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Install PM2**
   ```bash
   npm install -g pm2
   ```

3. **Create ecosystem file**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'planning-poker',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
         NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbG...'
       }
     }]
   }
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t planning-poker .
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... \
     planning-poker
   ```

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name poker.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

Required for all deployments:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOi...` |

### Where to Get These

1. Go to your Supabase project dashboard
2. Click **Project Settings** (gear icon)
3. Navigate to **API** section
4. Copy **Project URL** and **anon public** key

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test room creation
- [ ] Test joining a room
- [ ] Test voting flow
- [ ] Test real-time updates (open in 2 browsers)
- [ ] Check mobile responsiveness
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (automatic on Vercel/Netlify)
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Test Supabase connection limits
- [ ] Review Supabase usage dashboard

## Performance Optimization

### 1. Enable Edge Functions (Vercel)

```javascript
// next.config.js
export const config = {
  runtime: 'edge',
}
```

### 2. Add Caching Headers

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },
}
```

### 3. Enable Compression

Automatic on Vercel, Netlify. For self-hosted:

```javascript
// Add to next.config.js
compress: true,
```

## Monitoring & Analytics

### Vercel Analytics (Built-in)

Already included! View in Vercel dashboard.

### Custom Analytics

```bash
# Install Plausible or Google Analytics
npm install next-plausible
# or
npm install @next/third-parties
```

### Error Tracking with Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## Scaling Considerations

### Database (Supabase)

| Tier | Price | Connections | Storage | Transfer |
|------|-------|-------------|---------|----------|
| Free | $0 | 200 | 500 MB | 5 GB |
| Pro | $25/mo | 1,500 | 8 GB | 50 GB |
| Team | $599/mo | 3,000 | 100 GB | 200 GB |

### CDN (Vercel)

- Free tier: Unlimited bandwidth
- Pro tier: $20/mo with enhanced DDoS protection

## Troubleshooting

### Build fails on Vercel

```bash
# Check Node version
# Add to package.json:
"engines": {
  "node": ">=18.0.0"
}
```

### Environment variables not working

- Ensure they start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check for typos in variable names

### Real-time not connecting in production

- Verify Supabase project is active
- Check browser console for CORS errors
- Ensure WebSocket connections are allowed

### 404 on page refresh

Next.js handles this automatically. If using Nginx:

```nginx
try_files $uri $uri/ /index.html;
```

## Cost Estimation

### Small Team (< 50 users/day)

- **Hosting:** Free (Vercel/Netlify)
- **Database:** Free (Supabase)
- **Total:** $0/month

### Medium Team (50-500 users/day)

- **Hosting:** Free or $20/mo (Vercel Pro)
- **Database:** $25/mo (Supabase Pro)
- **Total:** $25-45/month

### Large Organization (500+ users/day)

- **Hosting:** $20-50/mo (Vercel Pro)
- **Database:** $599/mo (Supabase Team)
- **Monitoring:** $26/mo (Sentry)
- **Total:** ~$650/month

## Security Best Practices

1. **Use HTTPS only** (automatic on Vercel/Netlify)
2. **Enable Supabase RLS** (already configured)
3. **Rate limiting** (use Vercel's built-in protection)
4. **Regular updates** (`npm update` monthly)
5. **Security headers** (add to `next.config.js`)

```javascript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
    ],
  }]
}
```

## Need Help?

- 📚 [Vercel Documentation](https://vercel.com/docs)
- 📚 [Supabase Documentation](https://supabase.com/docs)
- 💬 Open an issue on GitHub
- 📧 Contact support

---

**Happy Deploying! 🚀**
