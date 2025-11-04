# 🚀 P-Type Web Deployment Guide

Complete guide to deploying your modern 3D P-Type game to Vercel with Postgres and Hyper3D Rodin integration.

## 📋 Prerequisites Checklist

- [ ] Vercel account ([sign up here](https://vercel.com/signup))
- [ ] Hyper3D Rodin Business Account API key
- [ ] GitHub repository connected to Vercel
- [ ] Node.js 18+ installed locally

## 🔧 Step 1: Local Setup

### 1.1 Install Dependencies

```bash
cd /path/to/ptype
npm install
```

### 1.2 Configure Environment Variables

Create `.env.local` file:

```env
RODIN_API_KEY=your_rodin_business_api_key_here
RODIN_MODE=MAIN_SITE
```

### 1.3 Test Locally

```bash
# Development mode
npm run dev

# Build test
npm run build
npm run preview
```

Visit `http://localhost:3000` and verify:
- ✅ Main menu loads
- ✅ 3D scene renders
- ✅ No console errors

## 🌐 Step 2: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: modernize to web-based 3D game"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your `ptype` repository
   - Vercel will auto-detect Vite
   - Click "Deploy"

### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

## 💾 Step 3: Set Up Vercel Postgres

### 3.1 Create Database

1. Go to your project in Vercel Dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it `ptype-db`
6. Select region (choose closest to users)
7. Click "Create"

### 3.2 Connect Database

Vercel automatically adds these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3.3 Run Database Migration

Two options:

**Option 1: Vercel Dashboard (Easiest)**
1. Go to Storage → ptype-db → Query
2. Copy content from `api/schema.sql`
3. Paste and click "Execute"

**Option 2: Vercel CLI**
```bash
# Connect to your database
vercel env pull .env.local

# Use psql (requires PostgreSQL client)
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -f api/schema.sql
```

**Option 3: Using Code**
```bash
# Create a migration script
node -e "
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const schema = fs.readFileSync('api/schema.sql', 'utf8');
sql.query(schema).then(() => console.log('Migration complete'));
"
```

## 🔐 Step 4: Configure Environment Variables

### 4.1 Add Rodin API Key

In Vercel Dashboard → Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `RODIN_API_KEY` | your_api_key | Production, Preview, Development |
| `RODIN_MODE` | `MAIN_SITE` | Production, Preview, Development |

### 4.2 Verify Database Variables

Check that Postgres variables are present:
- ✅ POSTGRES_URL
- ✅ POSTGRES_PRISMA_URL
- ✅ All other Postgres vars

## 🎯 Step 5: Verify Deployment

### 5.1 Check Build

Go to Deployments tab and verify:
- ✅ Build succeeded
- ✅ No build errors
- ✅ All chunks generated

### 5.2 Test Production Site

Visit your deployment URL (e.g., `ptype.vercel.app`):

**Checklist:**
- [ ] Page loads without errors
- [ ] 3D scene renders correctly
- [ ] Main menu is interactive
- [ ] Can start a game
- [ ] HUD displays correctly
- [ ] No console errors
- [ ] PWA installable (check Chrome DevTools → Application)

### 5.3 Test PWA Features

1. **Desktop (Chrome/Edge)**
   - Look for install icon in address bar
   - Click to install
   - Launch installed app
   - Verify offline mode (DevTools → Network → Offline)

2. **Mobile (iOS/Android)**
   - Open site in Safari/Chrome
   - Tap "Share" → "Add to Home Screen"
   - Launch from home screen
   - Should feel like native app

## 🔄 Step 6: Continuous Deployment

Every push to `main` automatically:
1. Triggers new build
2. Runs tests (if configured)
3. Deploys to production
4. Updates all serverless functions

### Branch Previews

Push to any branch for automatic preview deployment:
```bash
git checkout -b feature/new-ships
git push origin feature/new-ships
```

Vercel creates unique preview URL for testing.

## 🧪 Step 7: Testing Checklist

### Functionality Tests
- [ ] All game modes work (Normal + 7 programming languages)
- [ ] Typing mechanics function correctly
- [ ] Score tracking works
- [ ] Health/shield system operates
- [ ] Boss battles trigger at correct levels
- [ ] Power-ups can be used
- [ ] EMP weapon works

### Performance Tests
- [ ] 60 FPS on desktop
- [ ] 30+ FPS on mobile
- [ ] 3D models load without lag
- [ ] No memory leaks during long sessions
- [ ] Smooth transitions between screens

### Database Tests
- [ ] Can create profile
- [ ] Scores save correctly
- [ ] Achievements unlock
- [ ] Leaderboards populate
- [ ] Settings persist

## 🚨 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "TypeScript errors"**
```bash
# Check types
npm run build

# Fix errors in indicated files
```

### Database Connection Issues

**Error: "Cannot connect to Postgres"**
1. Verify database is created
2. Check environment variables are set
3. Try reconnecting in Vercel dashboard

### Rodin API Errors

**Error: "Rodin API key invalid"**
1. Verify API key in environment variables
2. Check key has correct permissions
3. Ensure `RODIN_MODE` is set correctly

### 3D Rendering Issues

**Black screen or no 3D scene**
1. Check browser console for WebGL errors
2. Verify GPU acceleration is enabled
3. Test on different browser
4. Check if browser supports WebGL 2.0

## 📊 Monitoring

### Vercel Analytics

Enable in project settings to track:
- Page views
- Performance metrics
- User engagement
- Error rates

### Custom Monitoring

Add to `web/src/utils/analytics.ts`:
```typescript
export function trackEvent(name: string, data?: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, data);
  }
}
```

## 🔒 Security

### Best Practices
- ✅ API keys in environment variables only
- ✅ No sensitive data in client code
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ CORS configured for API routes
- ✅ Input validation on all forms

## 🎉 Post-Deployment

### 1. Set Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your domain
3. Configure DNS records
4. Wait for SSL certificate

### 2. Configure CDN
Vercel automatically uses Edge Network:
- Global CDN
- Asset optimization
- Automatic compression
- Smart routing

### 3. Monitor Performance
- Check Vercel Analytics
- Monitor database usage
- Track Rodin API usage
- Review error logs

## 📈 Scaling Considerations

### Database
- Start: Hobby plan (free)
- Growth: Pro plan (60 GB)
- Scale: Enterprise (unlimited)

### Rodin API
- Monitor generation quotas
- Implement caching strategy
- Pre-generate common assets
- Use CDN for model files

### Vercel
- Hobby: Free (personal projects)
- Pro: $20/month (commercial)
- Enterprise: Custom pricing

## 🆘 Getting Help

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)
- [Three.js Documentation](https://threejs.org/docs/)
- [Hyper3D Rodin Docs](https://hyperhuman.deemos.com/rodin)

### Support Channels
- GitHub Issues: [your-repo-url/issues]
- Vercel Discord: [vercel.com/discord]
- Community Forum: [your-forum-url]

## ✅ Deployment Complete!

Your P-Type 3D game is now live! 🎮🚀

**Next Steps:**
1. Share your deployment URL
2. Test on multiple devices
3. Gather user feedback
4. Iterate and improve
5. Add more features!

---

**Pro Tips:**
- Use preview deployments for testing
- Set up custom domains for production
- Monitor Vercel Analytics
- Keep dependencies updated
- Pre-generate 3D assets during build

Happy typing! 🎯✨
