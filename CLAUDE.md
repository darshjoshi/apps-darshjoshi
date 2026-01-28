# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **multi-app platform** built with a split frontend/backend architecture. The key design pattern is that each independent application lives in its own route namespace on both the frontend and backend, while sharing common infrastructure.

### Monorepo Structure
- **frontend/** - Next.js 14+ with App Router (TypeScript + Tailwind CSS)
- **backend/** - FastAPI Python API (Python 3.11+)
- Both services run independently and communicate via HTTP

### Multi-App Pattern
Each app is isolated in its own namespace:
- Frontend: `app/app{N}/page.tsx` - Individual Next.js routes
- Backend: `app/api/routes/app{N}.py` - FastAPI routers with `/app{N}` prefix
- API Client: `lib/api.ts` exports `app{N}API` objects with typed methods

This allows multiple independent applications to coexist under a single dashboard while maintaining separation of concerns.

## Development Commands

### Running the Full Stack
Development requires **two terminal sessions** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on `localhost:3000`, backend on `localhost:8000`.

### Frontend Commands
```bash
npm run dev     # Start dev server with hot reload
npm run build   # Production build (creates .next/ directory)
npm run start   # Serve production build
npm run lint    # Run ESLint
```

### Backend Commands
```bash
# First time setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Development
uvicorn main:app --reload              # Start with hot reload
uvicorn main:app --reload --port 8000  # Specify port explicitly

# Production
uvicorn main:app --host 0.0.0.0 --port $PORT  # Used by Render/Railway
```

### API Documentation
When backend is running, auto-generated docs are available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### Testing API Endpoints
**Without API Key (development with API_KEY unset):**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/example-app/data
```

**With API Key (production or when API_KEY is set):**
```bash
# Public endpoints (no key needed)
curl https://apis.darshjoshi.com/health

# Protected endpoints (require X-API-Key header)
curl -H "X-API-Key: your-api-key-here" https://apis.darshjoshi.com/api/example-app/data

# POST request with API key
curl -X POST -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://apis.darshjoshi.com/api/example-app/data
```

**Expected error without API key:**
```json
{
  "detail": "Invalid or missing API key"
}
```

## Adding a New App

Follow this pattern to add a new app to the platform. Apps can be **full-stack** (with backend API) or **frontend-only** (no backend needed).

### Frontend-Only Apps (Recommended for Simple Tools)
For apps that don't need backend processing (like Job Search X-Ray):

**1. Create Landing Page** - `frontend/app/{app-name}/page.tsx`:
- White paper format explaining what the app does
- "Why it works" section with benefits
- "How it works" step-by-step breakdown
- Examples and use cases
- "TRY IT NOW" button linking to `/app-name/try`

**2. Create Interactive Tool** - `frontend/app/{app-name}/try/page.tsx`:
- Input form using custom UI components (NO system selectors)
- Client-side logic for processing/generation
- Results display with copy-to-clipboard functionality
- Reset/New action buttons
- Pro tips section

**3. Metadata Layout** - `frontend/app/{app-name}/layout.tsx`:
```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Name | Apps Dashboard",
  description: "Brief description of your app",
  openGraph: {
    type: 'website',
    title: 'App Name | Apps Dashboard',
    description: 'Brief description of your app',
    url: 'https://apps.darshjoshi.com/{app-name}',
    images: [
      {
        url: '/api/og?title=App Name&description=Brief description',
        width: 1200,
        height: 630,
        alt: 'App Name - Apps Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'App Name | Apps Dashboard',
    description: 'Brief description of your app',
    creator: '@darshjoshii',
    images: ['/api/og?title=App Name&description=Brief description'],
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**4. Update Homepage** - Add to `frontend/app/page.tsx` apps array

**When to Use Frontend-Only:**
- Query/string generators
- Calculators and converters
- Reference tools
- Educational/documentation apps
- Any app where logic can run entirely in the browser

### Full-Stack Apps (With Backend API)
For apps that need server-side processing, AI inference, or database access:

### 1. Backend Route (FastAPI)
Create `backend/app/api/routes/app{N}.py`:
```python
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/app{N}", tags=["app{N}"])

@router.get("/data")
async def get_data() -> Dict[str, Any]:
    return {"message": "Hello from App {N}"}
```

Register in `backend/main.py`:
```python
from app.api.routes import example_app, app{N}
# ...
app.include_router(app{N}.router, prefix=settings.API_V1_STR)
```

### 2. Frontend Route (Next.js)
Create `frontend/app/app{N}/page.tsx` following the existing pattern in ats-boss.

**Add Layout with Metadata for Link Previews:**
Create `frontend/app/app{N}/layout.tsx`:
```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Name | Apps Dashboard",
  description: "Brief description of your app",
  openGraph: {
    type: 'website',
    title: 'App Name | Apps Dashboard',
    description: 'Brief description of your app',
    url: 'https://apps.darshjoshi.com/app{N}',
    images: [
      {
        url: '/api/og?title=App Name&description=Brief description',
        width: 1200,
        height: 630,
        alt: 'App Name - Apps Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'App Name | Apps Dashboard',
    description: 'Brief description of your app',
    creator: '@darshjoshii',
    images: ['/api/og?title=App Name&description=Brief description'],
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### 3. API Client
Add to `frontend/lib/api.ts`:
```typescript
export const app{N}API = {
  getData: () => api.get('/api/app{N}/data'),
  postData: (data: any) => api.post('/api/app{N}/data', data),
};
```

### 4. Homepage Card
Add app card to `frontend/app/page.tsx` in the `apps` array.

### 5. Use Reusable Components
- **AppLayout Component**: Import `AppLayout` from `@/components/layouts/AppLayout` for consistent page structure
  - Provides grid background, header with app name, and footer
  - Supports back button to app landing page
  - Example: `<AppLayout appName="APP NAME" backUrl="/app-name">`
- **Logo Component**: Import `Logo` from `@/components/ui/logo` for consistent branding
- **Button Component**: Import `Button` from `@/components/ui/button` for styled buttons
- **Design Classes**: Use `.grid-bg`, `.border-hover`, `.glow-on-hover` for consistent styling

### 6. Two-Page Pattern (Landing + Tool)
Most apps use a two-page structure:
- **Landing Page** (`/app-name/page.tsx`): White paper explaining the app, wrapped in AppLayout
- **Interactive Tool** (`/app-name/try/page.tsx`): The actual tool, wrapped in AppLayout with backUrl
- This separates education from action, improving user understanding and conversion

## Branding & UI Components

### Custom Favicon
The site uses a custom JD logo favicon that matches the brutalist design theme:
- **Location**: `/frontend/public/favicon.svg`
- **Logo Component**: `/frontend/components/ui/logo.tsx` - Reusable JD logo component
- **Design**: Black square with white "JD" letters in monospace font with accent line
- **Configuration**: Referenced in `/frontend/app/layout.tsx` metadata

### Custom 404 Page
A witty, branded 404 error page matching the site's design language:
- **Location**: `/frontend/app/not-found.tsx`
- **Style**: White background with brutalist borders, JD logo, witty copy
- **Features**:
  - Humorous stats ("0 HELPFUL HINTS", "∞ BETTER PLACES")
  - Back to homepage button
  - Matches the grid background effect from homepage

### Dynamic Link Previews (Open Graph)
The platform generates dynamic social media preview images for all pages:

**Image Generator:**
- **Route**: `/frontend/app/api/og/route.tsx`
- **Type**: Edge runtime API route using `next/og` ImageResponse
- **Size**: 1200x630px (standard OG image size)
- **Style**: White background with subtle grid pattern, matching site design
- **Features**:
  - Dynamic title and description via query parameters
  - JD logo and "MINI PRODUCT SHOWCASE" branding
  - Brutalist corner accents
  - Monospace typography

**Query Parameters:**
- `title` - Page title (default: "Apps Dashboard")
- `description` - Page description (default: site description)

**Example URLs:**
```
/api/og
/api/og?title=Example%20App&description=Template%20application
```

**Metadata Configuration:**
- Root layout (`/frontend/app/layout.tsx`) includes comprehensive Open Graph and Twitter Card metadata
- Per-page metadata in nested layouts (e.g., `/frontend/app/example-app/layout.tsx`)
- Uses `metadataBase` for absolute URL generation

**Social Platform Support:**
- Twitter/X Cards (summary_large_image)
- LinkedIn previews
- Facebook Open Graph
- Discord, Slack, and other platforms that support OG protocol

**Testing Link Previews:**
1. Visit `/api/og` directly to see generated image
2. Use validators:
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
   - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
   - Generic OG Checker: https://www.opengraph.xyz/

### Design System
- **Theme**: Light mode only, high contrast black & white
- **Typography**: Geist Sans and Geist Mono fonts
- **Grid Background**: Subtle 50px grid pattern (`.grid-bg` class)
- **Borders**: 2px solid black borders for components
- **Corner Accents**: Brutalist design elements on cards

### UI Component Standards

**CRITICAL: No System Selectors Policy**
- **NEVER** use native `<select>` dropdowns anywhere in the application
- **NEVER** use system-native date pickers, color pickers, or other system UI elements
- All selection interfaces must use custom-built UI components that match the brutalist design system

**Custom Selector Patterns:**

1. **Button Grid for Single Selection** (replaces `<select>`):
```tsx
const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
  {options.map((option) => (
    <button
      key={option.value}
      onClick={() => setValue(option.value)}
      className={`px-4 py-3 border-2 font-mono text-sm font-bold transition-colors ${
        value === option.value
          ? 'border-black bg-black text-white'
          : 'border-gray-300 bg-white text-black hover:border-black'
      }`}
    >
      {option.label}
    </button>
  ))}
</div>
```

2. **Checkbox Cards for Multi-Selection**:
```tsx
<label
  className={`flex items-center gap-2 px-4 py-3 border-2 cursor-pointer transition-colors ${
    selected.includes(item)
      ? 'border-black bg-black text-white'
      : 'border-gray-300 bg-white hover:border-black'
  }`}
>
  <input type="checkbox" checked={selected.includes(item)} className="w-4 h-4" />
  <span className="text-sm font-mono font-bold uppercase">{item}</span>
</label>
```

3. **Toggle/Checkbox for Binary Choices**:
```tsx
<label className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white hover:bg-gray-50 cursor-pointer">
  <input type="checkbox" checked={value} className="w-5 h-5" />
  <span className="text-sm font-mono font-bold">OPTION NAME</span>
</label>
```

**Why This Matters:**
- Maintains consistent brutalist design language across all interactions
- Ensures visual consistency regardless of user's OS or browser
- Provides better control over styling and user experience
- Matches the high-contrast black & white theme perfectly

**Examples in Production:**
- **ATS Boss** (`/ats-boss/try`) - ATS system selector uses custom UI
- **Job Search X-Ray** (`/job-finder/try`) - Experience level and date range use button grids

## Current Applications

### App 1: ATS Boss
- **Route**: `/ats-boss`
- **Description**: Resume analysis and optimization for ATS systems (Workday, Greenhouse, Ashby)
- **Features**:
  - Phase 1: Deep ATS simulation using GPT-5-mini reasoning
  - Phase 2: Optimized PDF generation with ReportLab
  - Custom ATS selector UI component
  - Resume upload and job description input
  - Detailed scoring breakdown and recommendations

### App 2: Job Search X-Ray
- **Route**: `/job-finder`
- **Description**: Google search query generator for job hunting using X-Ray search techniques
- **Features**:
  - Generates 5-10 optimized Google search queries
  - Targets ATS platforms (Greenhouse, Lever, Workday, Taleo, Jobvite)
  - Custom button grids for experience level and date range selection
  - Boolean logic combinations (AND, OR, exclusions)
  - Location filtering with remote toggle
  - Company-specific and skills-based queries
  - Copy-to-clipboard and direct Google search links
- **Frontend-Only**: No backend API needed, uses deterministic query generation
- **Landing Page Pattern**: White paper (`/job-finder`) + Interactive tool (`/job-finder/try`)

**Query Generation Logic:**
The app generates multiple query variations based on user input:
1. **Recent Multi-Platform** - Searches all selected ATS platforms
2. **Skills-Focused** - Prioritizes user-specified skills (if provided)
3. **Platform-Specific** - Individual queries for top 2 selected platforms
4. **Location-Focused** - Emphasizes geographic preferences
5. **Company-Specific** - Targets specific companies (if provided)
6. **Ultra-Fresh** - Today-only postings
7. **Broad Search** - No ATS filter for maximum coverage
8. **Remote-First** - Remote opportunities alternative

**Experience Level Auto-Exclusions:**
- Entry/Junior → Excludes: Senior, Lead, Staff, Principal, Director
- Mid Level → Excludes: Junior, Entry, Director, VP
- Senior/Lead → No auto-exclusions
- Staff/Principal → No auto-exclusions

**Example Generated Query:**
```
(site:greenhouse.io OR site:boards.greenhouse.io) "AI Engineer" -"Senior" -"Lead" -"Staff" -"Principal" -"Director" after:2026-01-20
```

This pattern demonstrates:
- Platform URL targeting with `site:` operator
- Exact phrase matching with quotes
- Exclusion filters with `-` operator
- Date filtering with `after:` operator

## App Development Best Practices

### Choosing Frontend-Only vs Full-Stack

**Use Frontend-Only When:**
- Logic is deterministic (string manipulation, calculations, formatting)
- No sensitive data processing required
- No external API calls needed (or user provides their own API keys)
- Results can be computed instantly in the browser
- No database or persistent storage needed

**Use Full-Stack When:**
- AI inference or LLM calls required
- Heavy computation that would slow browser
- Sensitive API keys must be kept server-side
- Database access needed
- File processing (PDF, images, etc.)
- Rate limiting or usage tracking required

### Landing Page Structure (White Paper Pattern)

All apps should follow this landing page structure:

1. **Hero Section**
   - Status badge (BEAT THE ROBOTS, FIND JOBS LIKE A RECRUITER, etc.)
   - App title with underline border
   - "TRY HERE" or "TRY IT NOW" button linking to /try page
   - 3-4 paragraph explanation of the problem and solution

2. **How It Works**
   - Step-by-step breakdown (3 steps ideal)
   - Visual grid layout for steps
   - Clear, concise descriptions

3. **Features/Strategies Section**
   - Detailed breakdown of capabilities
   - Examples and use cases
   - Visual elements (cards, lists, code blocks)

4. **Under the Hood / Technical Details** (for complex apps)
   - Technology stack
   - Architecture overview
   - Performance considerations

5. **Call to Action**
   - Repeat the CTA button
   - Social proof or connection opportunity

### Interactive Tool (/try) Structure

1. **Input Form Section**
   - Clear labels with font-mono font-bold
   - Required fields marked with red asterisk
   - Helper text below each input (text-xs text-gray-600)
   - Custom UI components for all selectors
   - Large, prominent action button at bottom

2. **Results Section**
   - Hide form when results shown (single-page flow)
   - Clear heading with count or summary
   - Individual result cards with borders
   - Action buttons (Copy, Download, Search, etc.)
   - "New" or "Reset" button to start over

3. **Tips/Help Section**
   - Pro tips or usage guidance
   - Examples and best practices
   - Encourage exploration and experimentation

### UI Component Checklist

Before committing any new UI:
- ✅ No system `<select>` dropdowns
- ✅ No native date pickers or color pickers
- ✅ All borders are 2px solid black (or gray-300 for inactive states)
- ✅ Active states use black background with white text
- ✅ Hover states change border to black
- ✅ Font-mono for labels and technical text
- ✅ Consistent spacing using Tailwind's scale
- ✅ Responsive grid layouts (grid-cols-1 md:grid-cols-X)

## Key Architecture Patterns

### API Key Authentication
The platform uses API key authentication to protect all app endpoints.

**Implementation:**
- Authentication logic in `app/dependencies.py` - `verify_api_key` function
- Checks `X-API-Key` header against `settings.API_KEY`
- If `API_KEY` is empty/unset, authentication is **disabled** (development mode)
- If `API_KEY` is set, all protected routes require valid key

**Protected Routes:**
- All `/api/app{N}/*` endpoints require API key
- Root `/` and `/health` remain **public** (no key needed)

**Adding API Key to New Routes:**
```python
from fastapi import APIRouter, Depends
from app.dependencies import verify_api_key

router = APIRouter(
    prefix="/app{N}",
    tags=["app{N}"],
    dependencies=[Depends(verify_api_key)]  # This protects all routes
)
```

**Frontend API Key Usage:**
The axios client in `lib/api.ts` automatically adds `X-API-Key` header:
- Reads from `NEXT_PUBLIC_API_KEY` environment variable
- If empty, no header is added (works with disabled auth)
- All API calls include the key when configured

### Environment Variables
**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend endpoint
  - Dev: `http://localhost:8000/api` (from `.env.local`)
  - Prod: `https://apis.darshjoshi.com/api` (from `.env.production`)
- `NEXT_PUBLIC_API_KEY` - API key for authentication
  - Dev: Empty or unset (optional in development)
  - Prod: Set in Netlify dashboard with value from Render

**Backend:**
- Uses Pydantic Settings to load from `.env`
- All settings defined in `app/config.py`
- `API_KEY` - If empty, authentication disabled; if set, required for all app routes
- `BACKEND_CORS_ORIGINS` - Comma-separated list (parsed by model_validator)
- `SECRET_KEY` - Auto-generated in Render for production

### API Client Pattern
The `lib/api.ts` file exports a configured axios instance that:
- Automatically prefixes all requests with the API base URL
- Includes request/response interceptors (ready for auth tokens)
- Handles errors globally with console logging
- Each app exports its own API object (e.g., `app1API`, `app2API`)

### FastAPI Router Registration
All API routes are prefixed with `/api` (defined in `settings.API_V1_STR`):
- Individual routers define their own prefix (e.g., `/app1`)
- Final URL structure: `/api/app{N}/{endpoint}`
- Tags in routers organize endpoints in auto-generated docs

### Configuration Management
Backend uses `pydantic-settings` with `.env` file:
- Settings class in `app/config.py` defines all configuration
- Environment variables automatically override defaults
- CORS origins list supports both dev and prod URLs simultaneously

**CORS Origins Parsing:**
The `BACKEND_CORS_ORIGINS` field uses a special pattern to handle environment variables:
```python
BACKEND_CORS_ORIGINS: Union[str, List[str]] = "..."

@model_validator(mode='before')
@classmethod
def parse_cors_origins(cls, values: Any) -> Any:
    # Converts comma-separated string to list
    if isinstance(values, dict):
        cors_origins = values.get('BACKEND_CORS_ORIGINS')
        if isinstance(cors_origins, str):
            values['BACKEND_CORS_ORIGINS'] = [
                origin.strip() for origin in cors_origins.split(",")
            ]
    return values
```

**Why this is needed:**
- Pydantic Settings v2 auto-parses `List[str]` as JSON from env vars
- Environment variables like `https://a.com,https://b.com` fail JSON parsing
- Using `Union[str, List[str]]` prevents automatic JSON parsing
- `model_validator(mode='before')` manually converts string → list
- Works with both comma-separated strings (env vars) and lists (defaults)

### Common Frontend Patterns

**Copy to Clipboard with Feedback:**
```tsx
const [copiedId, setCopiedId] = useState<string | null>(null);

const handleCopy = async (text: string, id: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// In render:
<button onClick={() => handleCopy(text, id)}>
  {copiedId === id ? (
    <>
      <Check className="w-4 h-4" />
      COPIED!
    </>
  ) : (
    <>
      <Copy className="w-4 h-4" />
      COPY
    </>
  )}
</button>
```

**Form Input Pattern:**
```tsx
<div>
  <label className="block text-sm font-mono font-bold mb-2">
    FIELD LABEL <span className="text-red-600">*</span>
  </label>
  <input
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="e.g., Example Value"
    className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
  />
  <p className="text-xs text-gray-600 mt-1">Helper text explaining the field</p>
</div>
```

**Result Card Pattern:**
```tsx
<div className="border-2 border-black p-6 bg-white">
  <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
    CATEGORY
  </div>
  <h3 className="text-lg font-bold mb-1">Result Title</h3>
  <p className="text-sm text-gray-600">Result description</p>

  {/* Result content */}

  {/* Action buttons */}
  <div className="flex gap-3">
    <button className="flex-1 px-4 py-3 border-2 border-black bg-white text-black font-mono font-bold text-sm hover:bg-black hover:text-white transition-colors">
      ACTION 1
    </button>
    <button className="flex-1 px-4 py-3 border-2 border-black bg-black text-white font-mono font-bold text-sm hover:bg-white hover:text-black transition-colors">
      ACTION 2
    </button>
  </div>
</div>
```

**Single-Page Flow (Form → Results):**
```tsx
const [results, setResults] = useState<Result[] | null>(null);

return (
  <AppLayout appName="APP NAME" backUrl="/app-name">
    {/* Show form when no results */}
    {!results && (
      <section>
        <div className="border-2 border-black p-6 bg-white">
          {/* Form inputs */}
          <button onClick={handleGenerate}>GENERATE</button>
        </div>
      </section>
    )}

    {/* Show results when generated */}
    {results && (
      <section>
        {/* Results display */}
        <button onClick={() => setResults(null)}>NEW SEARCH</button>
      </section>
    )}
  </AppLayout>
);
```

**Date Formatting for Google `after:` Operator:**
```tsx
const getDateFilter = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `after:${date.toISOString().split('T')[0]}`; // Returns "after:YYYY-MM-DD"
};
```

## Deployment Architecture

### Production URLs
- **Frontend**: https://apps.darshjoshi.com (Netlify)
- **Backend**: https://apis.darshjoshi.com (Render with custom domain)
- **API Docs**: https://apis.darshjoshi.com/api/docs

### Frontend (Netlify)
**Configuration:**
- Configured via `netlify.toml` (base: `frontend/`, publishes `.next/`)
- Custom domain: `apps.darshjoshi.com`
- Auto-deploys from `main` branch on GitHub

**Environment Variables (set in Netlify Dashboard):**
```
NEXT_PUBLIC_API_URL=https://apis.darshjoshi.com/api
NEXT_PUBLIC_API_KEY=<value-from-render>
```

**Deployment Steps:**
1. Connect GitHub repo to Netlify
2. Netlify auto-detects Next.js from `netlify.toml`
3. Set environment variables in Netlify dashboard
4. Configure custom domain: `apps.darshjoshi.com`
5. Update GoDaddy DNS: CNAME `apps` → Netlify site

**Important Notes:**
- OG image route (`/api/og`) uses Edge Runtime and deploys automatically
- After deployment, test link previews with social media validators
- Link preview images are generated on-demand (no build-time generation needed)

### Backend (Render)
**Configuration:**
- Configured via `backend/render.yaml` (infrastructure as code)
- Plan: Starter Plus ($7/mo, always on, 512MB RAM)
- Region: Virginia (US East)
- Auto-detects Python, installs from `requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Environment Variables (in render.yaml):**
- `ENVIRONMENT=production`
- `DEBUG=false`
- `BACKEND_CORS_ORIGINS=https://apps.darshjoshi.com,http://localhost:3000`
- `SECRET_KEY` - Auto-generated by Render
- `API_KEY` - Auto-generated by Render (copy this for frontend)

**Custom Domain Setup (apis.darshjoshi.com):**
1. In Render Dashboard → Service → Settings → Custom Domain
2. Add domain: `apis.darshjoshi.com`
3. Render provides DNS records (usually CNAME)
4. In GoDaddy → DNS Management:
   - Add CNAME record: `apis` → Render's target
   - Or add A record if Render provides IP
5. Wait for DNS propagation (can take up to 48 hours, usually < 1 hour)
6. Render automatically provisions SSL certificate

**CORS Configuration:**
The backend CORS is configured to accept requests from:
- `https://apps.darshjoshi.com` (production frontend)
- `http://localhost:3000` (development frontend)

Update `backend/render.yaml` if you change frontend domain.

### Alternative: Railway
Backend includes `Procfile` for Railway/Heroku deployment if needed.

## GitHub Actions Deployment

The repository includes GitHub Actions workflows for manual deployment of both frontend and backend services.

### Workflows Location
- `.github/workflows/deploy-frontend.yml` - Netlify frontend deployment
- `.github/workflows/deploy-backend.yml` - Render backend deployment
- `.github/workflows/README.md` - Detailed setup instructions

### Frontend Deployment Workflow
**Manual trigger via GitHub Actions UI:**
- Builds Next.js with production environment variables
- Deploys to Netlify (production or preview)
- Requires secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_KEY`

**How to trigger:**
1. Go to GitHub → Actions → "Deploy Frontend to Netlify"
2. Click "Run workflow"
3. Select environment (production/preview)
4. Confirm

### Backend Deployment Workflow
**Manual trigger via GitHub Actions UI:**
- Triggers Render deployment via deploy hook
- Option to clear build cache
- Requires secret: `RENDER_DEPLOY_HOOK_URL`

**How to trigger:**
1. Go to GitHub → Actions → "Deploy Backend to Render"
2. Click "Run workflow"
3. Toggle "Clear build cache" if needed
4. Confirm

### Required GitHub Secrets
Configure in **Settings → Secrets and variables → Actions**:

**Frontend:**
- `NETLIFY_AUTH_TOKEN` - From Netlify User Settings → Applications → Personal access tokens
- `NETLIFY_SITE_ID` - From Netlify Site Settings → General → API ID
- `NEXT_PUBLIC_API_URL` - `https://apis.darshjoshi.com/api`
- `NEXT_PUBLIC_API_KEY` - Copy from Render environment variables

**Backend:**
- `RENDER_DEPLOY_HOOK_URL` - From Render Service Settings → Deploy Hook

See `.github/workflows/README.md` for detailed setup instructions.

## Database Integration (Future)

Database drivers are commented out in `requirements.txt`:
- PostgreSQL: Uncomment `psycopg2-binary`
- MongoDB: Uncomment `pymongo`
- ORM: Uncomment `sqlalchemy`

When adding database:
1. Create `app/database.py` for connection logic
2. Define models in `app/models/`
3. Define Pydantic schemas in `app/schemas/`
4. Update `app/config.py` with database URL settings
5. Business logic goes in `app/services/`

## Git Configuration

Repository owner: Darsh Joshi (contact@darshjoshi.com)
- Frontend has `.gitignore` that excludes `.env*` except `.env.example`
- Backend has separate `.gitignore` for Python artifacts
- Root `.gitignore` for OS files

## Quick Reference: Key Files

### Frontend Structure
```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Homepage with app cards
│   ├── not-found.tsx                 # Custom 404 page
│   ├── globals.css                   # Global styles & design system
│   ├── ats-boss/                     # Full-stack app example
│   │   ├── layout.tsx                # App-specific metadata
│   │   ├── page.tsx                  # Landing page (white paper)
│   │   └── try/
│   │       └── page.tsx              # Interactive tool page
│   ├── job-finder/                   # Frontend-only app example
│   │   ├── layout.tsx                # App-specific metadata
│   │   ├── page.tsx                  # Landing page (white paper)
│   │   └── try/
│   │       └── page.tsx              # Interactive tool page (no API calls)
│   └── api/
│       └── og/
│           └── route.tsx             # Dynamic OG image generator
├── components/
│   ├── layouts/
│   │   └── AppLayout.tsx             # Shared app layout wrapper
│   ├── shared/                       # Shared components (headers, footers, etc.)
│   ├── ats-boss/                     # ATS Boss specific components
│   └── ui/
│       ├── logo.tsx                  # Reusable JD logo component
│       └── button.tsx                # Styled button component
├── lib/
│   ├── api.ts                        # API client configuration
│   ├── api/
│   │   └── apps/                     # App-specific API clients
│   │       └── ats-boss.ts           # ATS Boss API types & methods
│   └── hooks/                        # Custom React hooks
│       └── useAPI.ts                 # Generic API hook
├── public/
│   └── favicon.svg                   # Site favicon
└── netlify.toml                      # Netlify deployment config
```

### Backend Structure
```
backend/
├── main.py                           # FastAPI app entry point
├── app/
│   ├── config.py                     # Settings & configuration
│   ├── dependencies.py               # API key verification
│   └── api/
│       └── routes/
│           └── example_app.py        # Example app routes
├── requirements.txt                  # Python dependencies
└── render.yaml                       # Render deployment config
```

### Important Files to Update When:
- **Adding new full-stack app**:
  - Homepage: `app/page.tsx` (add to apps array)
  - Backend: `backend/app/api/routes/` (new route file)
  - Backend: `backend/main.py` (register router)
  - Frontend: `app/{app-name}/` (landing page + /try page)
  - Frontend: `app/{app-name}/layout.tsx` (metadata)
  - API Client: `lib/api/apps/{app-name}.ts` (types and methods)

- **Adding new frontend-only app**:
  - Homepage: `app/page.tsx` (add to apps array)
  - Frontend: `app/{app-name}/page.tsx` (landing/white paper)
  - Frontend: `app/{app-name}/try/page.tsx` (interactive tool)
  - Frontend: `app/{app-name}/layout.tsx` (metadata)
  - NO backend routes needed

- **Adding selection UI (dropdowns, pickers, etc.)**:
  - **CRITICAL**: Use custom button grids or checkbox cards
  - Reference: `/job-finder/try/page.tsx` (experience level, date range)
  - Reference: `/ats-boss/try/page.tsx` (ATS system selector)
  - NEVER use native `<select>` elements

- **Changing branding**:
  - `components/ui/logo.tsx` (logo component)
  - `public/favicon.svg` (site favicon)
  - `api/og/route.tsx` (OG image generator)

- **Updating design**:
  - `globals.css` (design system variables and utilities)
  - Ensure all changes maintain brutalist black & white theme

- **Modifying metadata**:
  - `app/layout.tsx` (root metadata)
  - Per-app `layout.tsx` files (app-specific metadata)
  - OG image parameters in metadata configs
