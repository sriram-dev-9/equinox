# Deployment Guide for Equinox

## 🚀 Vercel Deployment Setup

### Prerequisites
- Vercel account
- MongoDB Atlas database (or any MongoDB instance accessible from the internet)
- All required API keys

### Step 1: Environment Variables

In your Vercel project settings, add these environment variables:

#### **Critical Variables**

```env
# Database
MONGODB_URI=your_production_mongodb_connection_string

# Authentication - MUST be your production URL
BETTER_AUTH_SECRET=your_random_secret_key_min_32_chars
BETTER_AUTH_URL=https://your-domain.vercel.app

# API Keys
FINNHUB_API_KEY=your_finnhub_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### Step 2: Fix BETTER_AUTH_URL

**Option A: Manual Update (Quick Fix)**
1. Go to your Vercel project settings
2. Set `BETTER_AUTH_URL=https://your-actual-domain.vercel.app`
3. Redeploy your app

**Option B: Already Fixed in Code (Automatic)**
The code now automatically uses `VERCEL_URL` if `BETTER_AUTH_URL` is not set. But it's **highly recommended** to set it explicitly.

### Step 3: Deploy

```bash
# Push to your Git repository
git add .
git commit -m "Fix production auth and inngest configuration"
git push origin main

# Vercel will auto-deploy
```

Or deploy manually:
```bash
vercel --prod
```

## 🔍 Verifying Deployment

### 1. Check Authentication
- Try signing up with a new account
- Try signing in with an existing account
- Check browser console for any errors

### 2. Common Issues

#### Authentication Still Failing?
- **Check BETTER_AUTH_URL**: Must match your actual domain exactly
- **Check Console**: Look for CORS or cookie errors
- **Check Domain**: Make sure you're using HTTPS in production

#### Database Connection Issues?
- **IP Whitelist**: Make sure MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- **Connection String**: Use the full connection string with username/password

## 🛠️ Local Development

For local development, simply run:

```bash
npm run dev
```

Make sure your `.env` file has:
```env
BETTER_AUTH_URL=http://localhost:3000
```

## 📋 Checklist Before Deploying

- [ ] All environment variables added to Vercel
- [ ] `BETTER_AUTH_URL` set to production domain
- [ ] MongoDB allows connections from Vercel IPs
- [ ] All API keys are valid and have sufficient quota
- [ ] Tested authentication locally first

## 🆘 Troubleshooting

### Still Having Issues?

1. **Check Vercel Function Logs**
   ```
   Vercel Dashboard → Your Project → Deployments → [Latest] → Functions
   ```

2. **Check Environment Variables**
   - Go to Project Settings → Environment Variables
   - Verify all required variables are present
   - Make sure there are no typos

3. **Common Error Messages**

   - **"Failed to sign in"**: Check `BETTER_AUTH_URL` and MongoDB connection
   - **"Database connection failed"**: Check MongoDB URI and IP whitelist

---

Need more help? Check the [README.md](./README.md) or open an issue on GitHub.
