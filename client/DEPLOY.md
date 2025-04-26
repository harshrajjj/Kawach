# Deploying to Vercel

This document provides instructions for deploying the React client to Vercel.

## Prerequisites

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "New Project"
4. Import your Git repository
5. Configure the project:
   - Set the Framework Preset to "Vite"
   - Set the Root Directory to "client"
   - Set the Build Command to "npm run vercel-build"
   - Set the Output Directory to "dist"
6. Add Environment Variables:
   - VITE_BACKEND_API: Your backend API URL (e.g., https://your-backend-url.com)
7. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Run the Vercel CLI:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - What's your project name? (Enter a name)
   - In which directory is your code located? ./
   - Want to override the settings? Yes
   - Which settings would you like to override?
     - Build Command: npm run vercel-build
     - Output Directory: dist
     - Development Command: npm run dev

4. Add environment variables:
   ```bash
   vercel env add VITE_BACKEND_API
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to set the following environment variables in Vercel:

- `VITE_BACKEND_API`: The URL of your backend API

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Vercel deployment logs
2. Ensure your environment variables are set correctly
3. Verify that your backend API is accessible from the deployed client
4. Check for CORS issues if your backend and frontend are on different domains
