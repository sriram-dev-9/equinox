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

# Email (Nodemailer)
EMAIL_SERVER_HOST=your_smtp_host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email
EMAIL_SERVER_PASSWORD=your_password
EMAIL_FROM=your_sender_email

# API Keys
FINNHUB_API_KEY=your_finnhub_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Inngest (Required for Production)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Step 2: Inngest Cloud Setup

Since you can't run `npx inngest-cli@latest dev` in production, you need to use Inngest Cloud:

1. **Sign up for Inngest Cloud**
   - Go to [https://www.inngest.com](https://www.inngest.com)
   - Create a free account

2. **Create a New App**
   - Create an app called "equinox" (or your preferred name)
   - Get your `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`

3. **Add Keys to Vercel**
   - Add both keys to your Vercel environment variables
   - These keys allow Inngest Cloud to communicate with your deployed app

4. **Sync Your Functions**
   - After deployment, Inngest will automatically discover your functions at `/api/inngest`
   - You can view and monitor them in the Inngest dashboard

### Step 3: Fix BETTER_AUTH_URL

**Option A: Manual Update (Quick Fix)**
1. Go to your Vercel project settings
2. Set `BETTER_AUTH_URL=https://your-actual-domain.vercel.app`
3. Redeploy your app

**Option B: Already Fixed in Code (Automatic)**
The code now automatically uses `VERCEL_URL` if `BETTER_AUTH_URL` is not set. But it's **highly recommended** to set it explicitly.

### Step 4: Deploy

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

### 2. Check Inngest Integration
- Go to Inngest dashboard
- Verify functions are synced: `sendSignUpEmail`, `sendDailyNewsSummary`
- Test signup to trigger the welcome email

### 3. Common Issues

#### Authentication Still Failing?
- **Check BETTER_AUTH_URL**: Must match your actual domain exactly
- **Check Console**: Look for CORS or cookie errors
- **Check Domain**: Make sure you're using HTTPS in production

#### Inngest Events Not Working?
- **Verify Keys**: Both EVENT_KEY and SIGNING_KEY must be correct
- **Check Dashboard**: Functions should appear in Inngest dashboard
- **Check Logs**: Vercel function logs will show Inngest errors

#### Database Connection Issues?
- **IP Whitelist**: Make sure MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- **Connection String**: Use the full connection string with username/password

## 🛠️ Local Development

For local development, continue using:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx inngest-cli@latest dev
```

Make sure your `.env` file has:
```env
BETTER_AUTH_URL=http://localhost:3000
```

## 📋 Checklist Before Deploying

- [ ] All environment variables added to Vercel
- [ ] `BETTER_AUTH_URL` set to production domain
- [ ] Inngest account created and keys obtained
- [ ] MongoDB allows connections from Vercel IPs
- [ ] All API keys are valid and have sufficient quota
- [ ] Tested authentication locally first
- [ ] Verified email service is working

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

3. **Test API Endpoints**
   ```bash
   # Test auth endpoint
   curl https://your-domain.vercel.app/api/auth
   
   # Test inngest endpoint
   curl https://your-domain.vercel.app/api/inngest
   ```

4. **Common Error Messages**

   - **"Failed to sign in"**: Check `BETTER_AUTH_URL` and MongoDB connection
   - **"Inngest signing key invalid"**: Wrong `INNGEST_SIGNING_KEY` in Vercel
   - **"Database connection failed"**: Check MongoDB URI and IP whitelist

---

Need more help? Check the [README.md](./README.md) or open an issue on GitHub.
