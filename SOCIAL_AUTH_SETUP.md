# Social Authentication Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for your Academic Spark application.

## Prerequisites
- A Google account
- A GitHub account
- Access to your Supabase project dashboard

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `Academic Spark`
4. Click "Create"

### 1.2 Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: External
3. App name: `Academic Spark`
4. User support email: Your email
5. Developer contact information: Your email
6. Click "Save and Continue" through all steps

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: `Academic Spark Web Client`
5. **Authorized redirect URIs:**
   ```
   https://nhuxwgmafdjchljvqlna.supabase.co/auth/v1/callback
   http://localhost:8080/auth/v1/callback
   http://localhost:8081/auth/v1/callback
   ```
6. Click "Create"
7. **Save the Client ID and Client Secret**

## Step 2: GitHub OAuth Setup

### 2.1 Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name**: Academic Spark
   - **Homepage URL**: `http://localhost:8080`
   - **Application description**: Educational platform for learning
   - **Authorization callback URL**: `https://nhuxwgmafdjchljvqlna.supabase.co/auth/v1/callback`
4. Click "Register application"
5. **Save the Client ID and Client Secret**

## Step 3: Configure Supabase

### 3.1 Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nhuxwgmafdjchljvqlna`

### 3.2 Configure Google Provider
1. Go to "Authentication" → "Providers"
2. Find "Google" and toggle to enable
3. Enter:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. Click "Save"

### 3.3 Configure GitHub Provider
1. In "Providers" section, find "GitHub"
2. Toggle to enable
3. Enter:
   - **Client ID**: (from GitHub OAuth App)
   - **Client Secret**: (from GitHub OAuth App)
4. Click "Save"

## Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:8080/auth`
3. Try clicking the Google or GitHub buttons
4. You should be redirected to the respective OAuth provider
5. After authorization, you should be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**
   - Make sure the redirect URIs in Google/GitHub match exactly
   - Include both localhost and production URLs

2. **"Client ID not found" error**
   - Double-check the Client ID and Secret in Supabase
   - Ensure the OAuth app is properly configured

3. **"Redirect URI mismatch" error**
   - Verify the callback URL in GitHub matches: `https://nhuxwgmafdjchljvqlna.supabase.co/auth/v1/callback`

4. **"OAuth consent screen not configured"**
   - Complete the OAuth consent screen setup in Google Cloud Console

### Security Notes:

- Keep your Client Secrets secure
- Never commit them to version control
- Use environment variables in production
- Regularly rotate your secrets

## Production Deployment

When deploying to production:

1. Update redirect URIs to include your production domain
2. Update homepage URL in GitHub OAuth app
3. Consider using environment variables for secrets
4. Test the authentication flow in production

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all URLs and credentials
3. Ensure all APIs are enabled
4. Check Supabase logs for authentication errors 