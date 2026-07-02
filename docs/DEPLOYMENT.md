# Deployment Guidelines - Ram Ji Collection

The applications can be deployed to modern serverless and cloud hosting providers.

## Hosting Providers

1. **Frontend (`apps/web`) & Admin (`apps/admin`)**
   - Recommended Platform: **Vercel**
   - Automatically builds the Vite build assets and deploys them to a global edge CDN.

2. **Backend API (`apps/api`)**
   - Recommended Platform: **Railway** or **Render**
   - Builds utilizing the Node.js Express server runtime container.

3. **Database (PostgreSQL)**
   - Recommended Platform: **Supabase** or **Neon PostgreSQL**
   - Provides fully managed serverless PostgreSQL instances with connection pooling.

4. **Image Assets Storage**
   - Recommended Platform: **Cloudflare R2**
   - S3-compatible cloud storage bucket providing global file delivery with zero egress fees.
