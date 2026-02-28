# Clerk + Convex Auth Setup

For Clerk users to sync to the Convex `users` table, you must configure both Clerk and Convex.

## ⚠️ CRITICAL: Create Clerk JWT Template First

**If you see a 404 error on `/tokens/convex`, this is why!**

## 1. Create Clerk JWT Template

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **JWT Templates**
2. Click **"New template"** or **"Create template"**
3. Select **"Convex"** from the template list
4. **CRITICAL:** The template name must be exactly **`convex`** (lowercase)
   - ❌ NOT "Convex" (capitalized)
   - ❌ NOT "convex-template"  
   - ✅ YES "convex" (exactly)
5. Click **"Create"** or **"Save"**
6. Copy the **Issuer URL** shown (for your app: `https://crucial-chamois-31.clerk.accounts.dev`)

**Without this template, Clerk cannot provide Convex tokens and you'll get 404 errors!**

## 2. Add to Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev) → your project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** Your Issuer URL from step 1 (e.g. `https://crucial-chamois-31.clerk.accounts.dev`)

## 3. Redeploy

Run `npx convex dev` to sync the config. The Convex backend will now validate Clerk tokens and `ctx.auth.getUserIdentity()` will work in your mutations.
