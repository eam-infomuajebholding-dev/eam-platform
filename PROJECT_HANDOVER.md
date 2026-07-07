# PROJECT HANDOVER DOCUMENT

## 1. Executive Summary

This document provides a comprehensive technical handover for the **EAM (إعمار الأصالة والمعاصرة)** corporate website — a full-stack web application built for a Saudi Arabian engineering consultancy firm. The application features a public-facing corporate website with inline content management capabilities, an AI chatbot, Cloudinary-based media management, and a PostgreSQL-backed database for persistent content editing.

The project is built with React (TypeScript) on the frontend and Python FastAPI on the backend, deployed via the Atoms Cloud platform with AWS Lambda support.

---

## 2. Project Purpose and Current Status

**Purpose:** Corporate website for إعمار الأصالة والمعاصرة للاستشارات الهندسية (EAM Engineering Consultancy), providing:
- Public-facing pages showcasing services, projects, team, and investment opportunities
- Inline content editing system (admin edit mode)
- AI-powered customer support chatbot
- Digital business card with vCard download
- Contact form and consultation request system
- Dark/light theme support with RTL (Arabic) layout

**Current Status:** Production-ready. All core features are implemented, tested, and passing lint/build checks. The application is fully functional with database persistence, Cloudinary media uploads, and inline editing capabilities.

---

## 3. Frontend Framework, Version, and Architecture

| Attribute | Value |
|-----------|-------|
| Framework | React 18.3.1 |
| Language | TypeScript 5.5.3 |
| Build Tool | Vite 5.4.1 |
| UI Library | Shadcn/UI (Radix UI primitives) |
| Styling | Tailwind CSS 3.4.11 |
| State Management | React Context + TanStack React Query 5.56.2 |
| Routing | React Router DOM 6.30.0 |
| Architecture | Single Page Application (SPA) with client-side routing |

---

## 4. Backend Framework, Version, and Architecture

| Attribute | Value |
|-----------|-------|
| Framework | FastAPI (≥0.110.0) |
| Language | Python 3.x |
| Server | Uvicorn (standard, ≥0.29.0) |
| ORM | SQLAlchemy 2.0+ (async) |
| Database Driver | asyncpg (≥0.29.0) for PostgreSQL |
| Migration Tool | Alembic (≥1.13.0) |
| Lambda Handler | Mangum 0.19.0 |
| Architecture | Modular FastAPI with auto-generated CRUD routers, services, and models |

---

## 5. Programming Languages Used

| Language | Usage |
|----------|-------|
| TypeScript | Frontend application code (React components, utilities, hooks) |
| JavaScript | Build configuration, prerender scripts |
| Python | Backend API, database models, services, authentication |
| SQL | Database schema management (via SQLAlchemy ORM) |
| CSS | Tailwind CSS utility classes + custom styles |
| HTML | Entry point template (`index.html`) |

---

## 6. Package Manager(s) Used

| Manager | Scope | Lock File |
|---------|-------|-----------|
| pnpm | Frontend (Node.js packages) | `pnpm-lock.yaml` |
| pip | Backend (Python packages) | `requirements.txt` |

---

## 7. Complete Technology Stack

### Frontend
- React 18.3 + TypeScript
- Vite 5.4 (bundler/dev server)
- Tailwind CSS 3.4 + tailwindcss-animate
- Shadcn/UI (Radix UI component primitives)
- React Router DOM 6.30
- TanStack React Query 5.56
- Axios 1.6 (HTTP client)
- React Hook Form + Zod (form validation)
- Recharts (data visualization)
- Lucide React (icons)
- Sonner (toast notifications)
- date-fns (date utilities)
- Embla Carousel
- Cloudinary (media uploads via unsigned preset)
- IndexedDB (client-side media/data caching)
- `@metagptx/web-sdk` (Atoms Cloud SDK for backend communication)

### Backend
- FastAPI + Uvicorn
- SQLAlchemy 2.0 (async ORM)
- asyncpg (PostgreSQL async driver)
- aiosqlite (SQLite async driver for local dev)
- Alembic (database migrations)
- Pydantic 2.x (data validation)
- python-jose (JWT handling)
- httpx (async HTTP client)
- OpenAI SDK 2.16 (AI capabilities)
- Stripe (payment processing)
- PyMuPDF (PDF handling)
- Mangum (AWS Lambda adapter)
- python-dotenv (environment configuration)

### Infrastructure
- Atoms Cloud Platform (hosting, auth, database, object storage)
- AWS Lambda (serverless deployment option)
- PostgreSQL (production database)
- Cloudinary (media CDN and upload)
- OIDC (OpenID Connect authentication)

---

## 8. Project Folder Structure

```
/workspace/
├── app/
│   ├── frontend/                    # React frontend application
│   │   ├── src/
│   │   │   ├── api/                 # API configuration (settings)
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── admin/           # Admin/edit mode components
│   │   │   │   ├── blog/            # Blog-related components
│   │   │   │   └── ui/             # Shadcn/UI base components
│   │   │   ├── contexts/           # React Context providers
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── lib/                # Utility libraries and services
│   │   │   ├── pages/              # Page-level components (routes)
│   │   │   │   └── blog/           # Blog page components
│   │   │   ├── App.tsx             # Root app component with routing
│   │   │   ├── main.tsx            # Application entry point
│   │   │   └── vite-env.d.ts       # Vite type declarations
│   │   ├── prerender/              # Blog prerendering scripts
│   │   ├── public/                 # Static assets
│   │   │   └── assets/             # Images (logo.png)
│   │   ├── index.html              # HTML entry point
│   │   ├── vite.config.ts          # Vite configuration
│   │   ├── tailwind.config.ts      # Tailwind CSS configuration
│   │   ├── tsconfig.json           # TypeScript configuration
│   │   ├── package.json            # Node.js dependencies
│   │   └── .env                    # Environment variables (Cloudinary)
│   │
│   ├── backend/                    # Python FastAPI backend
│   │   ├── core/                   # Core modules (config, auth, database)
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── routers/                # FastAPI API route handlers
│   │   ├── services/               # Business logic layer
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── dependencies/           # FastAPI dependency injection
│   │   ├── middlewares/            # Custom middleware
│   │   ├── utils/                  # Utility functions
│   │   ├── data_models/            # Data model definitions
│   │   ├── skills_docs/            # SDK documentation
│   │   ├── alembic/                # Database migration scripts
│   │   ├── logs/                   # Application logs
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── lambda_handler.py       # AWS Lambda handler (Mangum)
│   │   ├── requirements.txt        # Python dependencies
│   │   └── alembic.ini             # Alembic configuration
│   │
│   └── .mgx/                      # Platform configuration (do not modify)
│       └── config.yaml
│
├── uploads/                        # User-uploaded source files
│   ├── 00000.jpeg                  # Original company logo
│   ├── unnamed.jpg                 # Services image
│   └── image-1 (*.png)            # Reference screenshots
│
└── .atoms/                         # Project context files
    ├── ATOMS.md                    # Project decisions and constraints
    ├── PROGRESS.md                 # Task tracking and progress
    └── ARCHITECTURE.md             # Architecture documentation
```

---

## 9. High-Level Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                         │
├─────────────────────────────────────────────────────────────┤
│  React SPA (Vite)                                            │
│  ├── React Router (client-side routing)                      │
│  ├── Context Providers (Auth, Theme, EditMode)               │
│  ├── TanStack Query (server state management)                │
│  ├── IndexedDB (local media/data cache)                      │
│  └── Cloudinary SDK (direct media uploads)                   │
├─────────────────────────────────────────────────────────────┤
│                    Vite Dev Proxy (/api → :8000)              │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Backend (Python)                                     │
│  ├── OIDC Authentication (cookie-based sessions)             │
│  ├── RESTful CRUD APIs (auto-generated from models)          │
│  ├── Object Storage Service                                  │
│  ├── AI Hub (OpenAI integration)                             │
│  ├── Stripe Payment Processing                               │
│  └── Health Check & Notifications                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (asyncpg)                               │
│  ├── Users & OIDC States                                     │
│  ├── Site Content (edits, pages, sections, settings)         │
│  ├── Business Data (projects, services, consultations)       │
│  └── Media References (videos, social links)                 │
├─────────────────────────────────────────────────────────────┤
│  External Services                                           │
│  ├── Cloudinary (media CDN & uploads)                        │
│  ├── Atoms Cloud OIDC Provider (authentication)              │
│  ├── OpenAI API (AI chatbot)                                 │
│  └── Stripe (payments)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Routing Structure and All Available Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Index` | Homepage with hero, services overview, and why-choose-us |
| `/about` | `About` | Company information and history |
| `/services` | `Services` | Services listing page |
| `/engineering-services` | `EngineeringServices` | Engineering services detail |
| `/government-services` | `GovernmentServices` | Government services detail |
| `/services/contracting` | `ContractingServices` | Contracting services detail |
| `/services/maintenance` | `MaintenanceServices` | Maintenance services detail |
| `/services/real-estate-development` | `RealEstateDevelopment` | Real estate development services |
| `/services/real-estate-marketing` | `RealEstateMarketing` | Real estate marketing services |
| `/projects` | `Projects` | Company projects showcase |
| `/team` | `Team` | Team members page |
| `/careers` | `Careers` | Job opportunities page |
| `/invest` | `Invest` | Investment opportunities |
| `/market` | `Market` | Market/marketplace page |
| `/consultation` | `Consultation` | Consultation request form |
| `/contact` | `Contact` | Contact information and form |
| `/contact-card` | `ContactCard` | Digital business card with vCard download |
| `/auth/callback` | `AuthCallback` | OIDC authentication callback handler |
| `/auth/error` | `AuthError` | Authentication error page |
| `/admin` | `AdminDashboard` | Activates edit mode and redirects to homepage |

---

## 11. Major Components and Their Responsibilities

### Layout & Navigation
| Component | Responsibility |
|-----------|---------------|
| `Layout.tsx` | Main layout wrapper with navbar, footer, theme toggle, edit mode overlay, background support |
| `Footer.tsx` | Site footer with social media links, quick links, editable in admin mode |
| `AIChatbot.tsx` | Floating AI chatbot widget using OpenAI via Atoms Cloud |
| `LoadingSpinner.tsx` | Loading state indicator |

### Admin/Edit Mode
| Component | Responsibility |
|-----------|---------------|
| `EditToolbar.tsx` | Floating admin toolbar for toggling edit mode, page background, sections, pages |
| `InlineEditable.tsx` | Core inline editing system — click-to-edit text, images, videos with DB persistence |
| `FileUploadDialog.tsx` | File upload dialog with Cloudinary integration |
| `NavigationManager.tsx` | Manage navigation menu items |
| `PageBackgroundEditor.tsx` | Change page backgrounds (color, image, video) |
| `PageManager.tsx` | Add/remove pages dynamically |
| `SectionManager.tsx` | Add/delete/reorder page sections |

### Contexts
| Context | Responsibility |
|---------|---------------|
| `AuthContext.tsx` | OIDC-based user authentication state (login, logout, user info) |
| `EditModeContext.tsx` | Simple password-gated edit mode toggle (password: `eam2024`) |
| `ThemeContext.tsx` | Dark/light theme management with localStorage persistence |

### Libraries/Services
| Library | Responsibility |
|---------|---------------|
| `api.ts` | Creates Atoms Cloud web-sdk client instance |
| `auth.ts` | OIDC authentication API calls (login, logout, getCurrentUser) |
| `cloudinary.ts` | Cloudinary unsigned upload utility (single and batch) |
| `config.ts` | Runtime configuration loader (API base URL resolution) |
| `dbService.ts` | Database service for site edits CRUD and media uploads |
| `mediaStorage.ts` | IndexedDB wrapper for media blob storage |
| `videoStorage.ts` | IndexedDB wrapper for video file storage |
| `dataStorage.ts` | IndexedDB wrapper for page data (projects, team, investments) |

---

## 12. Authentication and Authorization Flow

### Two-Layer Authentication System

**Layer 1: OIDC Authentication (Backend)**
- Uses OpenID Connect (OIDC) with PKCE flow
- Provider: Atoms Cloud identity platform
- Flow: `/api/v1/auth/login` → OIDC provider → `/auth/callback` → cookie-based session
- User model stores: id (platform sub), email, name, role (user/admin)
- Session maintained via HTTP-only cookies with `withCredentials: true`

**Layer 2: Edit Mode Authentication (Frontend)**
- Simple password gate for content editing: password is `eam2024`
- Stored in localStorage (`edit_mode_authenticated`)
- Controls visibility of inline editing overlays
- Independent of OIDC — allows quick admin access without full login

### Authorization
- Backend routes use `get_current_user` and `get_admin_user` dependencies
- Storage operations require admin role
- Entity CRUD operations have row-level security via `user_id` field
- Edit mode is purely frontend-gated (password check)

---

## 13. Database Type and Architecture

| Attribute | Value |
|-----------|-------|
| Database | PostgreSQL (production) / SQLite (local development) |
| Driver | asyncpg (PostgreSQL) / aiosqlite (SQLite) |
| ORM | SQLAlchemy 2.0 (async mode) |
| Migrations | Alembic |
| Connection | Async engine with connection pooling (QueuePool in server, NullPool in Lambda) |
| Session | AsyncSession with dependency injection via `get_db()` |

The database manager (`core/database.py`) handles:
- Automatic async driver normalization (postgresql → postgresql+asyncpg)
- Connection pool configuration based on environment (Lambda vs server)
- Lazy initialization for Lambda cold starts
- Table structure repair (adding missing columns to existing tables)
- Thread-safe initialization with asyncio locks

---

## 14. Complete Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | String(255) PK | Platform subject identifier (from OIDC) |
| email | String(255) NOT NULL | User email |
| name | String(255) | Display name |
| role | String(50) DEFAULT 'user' | Role: user or admin |
| created_at | DateTime(tz) | Account creation timestamp |
| last_login | DateTime(tz) | Last login timestamp |

### `oidc_states`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| state | String(255) UNIQUE | OIDC state parameter |
| nonce | String(255) | OIDC nonce |
| code_verifier | String(255) | PKCE code verifier |
| expires_at | DateTime(tz) | State expiration time |
| created_at | DateTime(tz) | Creation timestamp |

### `site_edits`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| page | String NOT NULL | Page path (e.g., "/about") |
| element_key | String NOT NULL | Stable element identifier |
| edit_type | String NOT NULL | Type: text, image, video |
| value | String NOT NULL | New content value |
| created_at | DateTime(tz) | Creation timestamp |
| updated_at | DateTime(tz) | Last update timestamp |

### `consultations`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| user_id | String | Associated user (nullable) |
| name | String NOT NULL | Client name |
| email | String NOT NULL | Client email |
| phone | String | Phone number |
| consultation_type | String | Type of consultation |
| message | String NOT NULL | Consultation message |
| status | String DEFAULT 'pending' | Status: pending/completed |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `contact_messages`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| user_id | String | Associated user (nullable) |
| name | String NOT NULL | Sender name |
| email | String NOT NULL | Sender email |
| phone | String | Phone number |
| subject | String | Message subject |
| message | String NOT NULL | Message body |
| status | String DEFAULT 'unread' | Status: unread/read |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `navigation_items`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| label | String NOT NULL | Display label |
| path | String NOT NULL | Route path |
| parent_id | Integer | Parent item for nesting |
| sort_order | Integer NOT NULL | Display order |
| is_visible | Boolean | Visibility toggle |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `page_contents`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| page_key | String NOT NULL | Page identifier |
| section_key | String NOT NULL | Section identifier |
| title | String | Section title |
| content | String | Section content |
| sort_order | Integer | Display order |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `page_sections`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| page_name | String NOT NULL | Page identifier |
| section_data | String NOT NULL | JSON section data |
| sort_order | Integer | Display order |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `projects`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| name | String NOT NULL | Project name |
| location | String | Project location |
| type | String | Project type |
| investment_amount | String | Investment amount |
| expected_return | String | Expected ROI |
| duration | String | Project duration |
| description | String NOT NULL | Project description |
| video_url | String | Associated video |
| image_url | String | Project image |
| status | String | Project status |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `services`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| title | String NOT NULL | Service title |
| description | String NOT NULL | Service description |
| icon | String | Icon identifier |
| image_url | String | Service image |
| page_path | String | Link to detail page |
| sort_order | Integer | Display order |
| is_active | Boolean | Active/inactive toggle |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `site_pages`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| title | String NOT NULL | Page title |
| path | String NOT NULL | Route path |
| background_type | String | Background type: color/image/video |
| background_value | String | Background value |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `site_settings`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| setting_key | String NOT NULL | Setting identifier |
| setting_value | String NOT NULL | Setting value |
| category | String | Setting category |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `site_videos`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| video_key | String NOT NULL | Video identifier |
| video_url | String NOT NULL | Video URL |
| title | String | Video title |
| page | String | Associated page |
| is_active | Boolean | Active toggle |
| created_at / updated_at | DateTime(tz) | Timestamps |

### `social_links`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment ID |
| platform | String NOT NULL | Platform name |
| url | String NOT NULL | Profile URL |
| icon | String | Icon identifier |
| sort_order | Integer | Display order |
| created_at / updated_at | DateTime(tz) | Timestamps |

---

## 15. File Storage and Uploads

### Primary: Cloudinary (Cloud Media CDN)
- **Cloud Name:** `dsta3yeml`
- **Upload Preset:** `dsta3yeml` (unsigned upload)
- **Usage:** All media uploads (images, videos) from admin edit mode
- **Integration:** Direct browser-to-Cloudinary upload (no backend proxy)
- **Endpoint:** `https://api.cloudinary.com/v1_1/dsta3yeml/auto/upload`

### Secondary: Atoms Cloud Object Storage
- **Bucket:** `site-media` (for backend-managed uploads)
- **Access:** Via `@metagptx/web-sdk` storage API
- **Usage:** Programmatic uploads from dbService.ts

### Local Fallback: IndexedDB
- **Database:** `inline-edits-db` (store: `media`) — inline edit media cache
- **Database:** `page-backgrounds-db` (store: `videos`) — page background videos
- **Database:** `app-data-db` (store: `pages-data`) — page data (projects, team, investments)
- **Usage:** Fallback when Cloudinary is not configured; also serves as local cache

### Static Assets
- `/public/assets/logo.png` — Company logo (1.5MB)
- `/public/favicon.svg` — Browser favicon
- `/public/content.json` — Static content configuration
- `/public/robots.txt` — Search engine crawler rules

---

## 16. Static Assets Structure

```
app/frontend/public/
├── assets/
│   └── logo.png              # Company logo (1,530,235 bytes)
├── content.json              # Static content configuration
├── favicon.svg               # Browser tab icon
└── robots.txt                # SEO crawler directives
```

External CDN images referenced in code:
- `https://mgx-backend-cdn.metadl.com/generate/images/...` — Generated service images

---

## 17. Environment Variables Required

### Frontend (`app/frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for media uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |
| `VITE_API_BASE_URL` | (Optional) Backend API base URL override |
| `VITE_PORT` | (Optional) Dev server port, defaults to 3000 |
| `VITE_APP_TITLE` | (Auto) Application title for HTML meta |
| `VITE_APP_DESCRIPTION` | (Auto) Application description for HTML meta |
| `VITE_APP_LOGO_URL` | (Auto) Favicon URL |

### Backend (Environment / Platform)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PYTHON_BACKEND_URL` | Backend public URL (for OIDC callbacks) |
| `IS_LAMBDA` | Set to "true" when running in AWS Lambda |
| `AWS_LAMBDA_FUNCTION_NAME` | Lambda function name (auto-set by AWS) |
| `LOCAL_PATCH` | Set to "true" for local development URL patching |
| `OIDC_CLIENT_ID` | OpenID Connect client ID |
| `OIDC_CLIENT_SECRET` | OpenID Connect client secret |
| `OIDC_ISSUER_URL` | OIDC provider issuer URL |
| `OPENAI_API_KEY` | OpenAI API key (for AI chatbot) |
| `STRIPE_SECRET_KEY` | Stripe secret key (for payments) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## 18. External Services, APIs, and Third-Party Integrations

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| Cloudinary | Media upload and CDN delivery | Frontend direct upload (unsigned preset) |
| Atoms Cloud OIDC | User authentication | Backend OIDC flow with PKCE |
| Atoms Cloud Object Storage | File storage | Backend storage service |
| OpenAI API | AI chatbot responses | Backend AI hub router |
| Stripe | Payment processing | Backend payment router |
| Atoms Cloud Database | PostgreSQL hosting | Backend SQLAlchemy connection |

---

## 19. Build Process

### Frontend Build
```bash
cd app/frontend
pnpm install          # Install dependencies
pnpm run lint         # ESLint check
pnpm run build        # Vite production build → dist/
```

The build process:
1. Compiles TypeScript to JavaScript
2. Bundles with Rollup (via Vite) with manual chunk splitting
3. Generates optimized vendor chunks (react, router, ui, form, utils, query)
4. Runs blog prerendering if SEO content exists
5. Generates sitemap.xml and robots.txt
6. Outputs to `dist/` directory

### Backend
The backend does not have a traditional "build" step. It runs directly as a Python application:
```bash
cd app/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

For Lambda deployment, `lambda_handler.py` wraps the FastAPI app with Mangum.

---

## 20. Development Workflow

### Local Development Setup
```bash
# Terminal 1: Frontend
cd app/frontend
pnpm install
pnpm run dev          # Starts Vite dev server on port 3000

# Terminal 2: Backend
cd app/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Development Features
- **Hot Module Replacement (HMR):** Vite provides instant updates on file save
- **API Proxy:** Vite proxies `/api` requests to `http://localhost:8000`
- **File Watching:** Polling enabled (`usePolling: true, interval: 600ms`)
- **Source Locator:** `@metagptx/vite-plugin-source-locator` for debugging

### Code Quality
- ESLint with TypeScript plugin for frontend linting
- TypeScript strict mode (with relaxed `noImplicitAny: false`)
- Pydantic validation on all backend request/response schemas

---

## 21. Production Deployment Workflow

### Current Deployment (Atoms Cloud)
1. Code is committed and pushed
2. Atoms Cloud builds the frontend (`pnpm run build`)
3. Frontend static files served from CDN
4. Backend deployed as AWS Lambda function (via Mangum)
5. Database provisioned as managed PostgreSQL
6. Environment variables injected by platform

### Deployment Architecture
- Frontend: Static files served via CDN with SPA fallback
- Backend: AWS Lambda with API Gateway
- Database: Managed PostgreSQL (connection via `DATABASE_URL`)
- Storage: Atoms Cloud Object Storage + Cloudinary CDN

---

## 22. Required Commands for Development and Production

### Development
```bash
# Frontend
pnpm install                    # Install dependencies
pnpm run dev                    # Start dev server (port 3000)
pnpm run lint                   # Run ESLint
pnpm run build                  # Production build
pnpm run preview                # Preview production build locally

# Backend
pip install -r requirements.txt # Install Python dependencies
uvicorn main:app --reload       # Start with auto-reload
alembic upgrade head            # Run database migrations
```

### Production
```bash
# Frontend build
cd app/frontend
pnpm install --frozen-lockfile
pnpm run build

# Backend (server mode)
cd app/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Backend (Lambda mode)
# Deployed via lambda_handler.py with Mangum wrapper
```

---

## 23. SEO Configuration

### Implemented SEO Features
- **Sitemap Generation:** `vite-plugin-sitemap` generates `sitemap.xml` at build time
- **Robots.txt:** Auto-generated with sitemap reference
- **Meta Tags:** Dynamic title, description, and Open Graph tags via Vite env vars
- **Blog Prerendering:** `vite-prerender-plugin` prerenders blog routes as static HTML
- **Semantic HTML:** Proper heading hierarchy and landmark elements
- **Static Blog Pages:** Blog pages rendered as pure static HTML (no client-side hydration) for optimal crawler indexing

### Blog Prerendering System
- `prerender/blog-routes.js` — Collects markdown files and generates route list
- `prerender/blog-sitemap.js` — Generates lastmod dates for sitemap
- `prerender/blog.js` — Prerender script for blog content
- Blog pages include `<meta name="prerender-static-page" content="blog">` to skip React hydration

---

## 24. Performance Optimizations Currently Implemented

1. **Code Splitting:** Manual chunk configuration splits vendor libraries into separate bundles:
   - `react-vendor` (React, ReactDOM)
   - `router-vendor` (React Router)
   - `ui-vendor` (all Radix UI components)
   - `form-vendor` (React Hook Form, Zod)
   - `utils-vendor` (Axios, clsx, date-fns, Lucide)
   - `query-vendor` (TanStack React Query)

2. **Lazy Loading:** Route-based code splitting via React Router

3. **Database Connection Pooling:**
   - Server: QueuePool with 10 connections, 20 overflow, 1hr recycle
   - Lambda: NullPool (fresh connection per request)

4. **Caching:**
   - In-memory cache for site edits (`editsCache` Map in dbService.ts)
   - IndexedDB for media blobs (avoids re-downloading)
   - TanStack Query client-side cache for API responses

5. **Image Optimization:**
   - Cloudinary CDN delivery with automatic format optimization
   - Chunk size warning limit set to 1000KB

6. **Static Prerendering:** Blog pages pre-rendered at build time

---

## 25. Security Considerations

### Authentication Security
- OIDC with PKCE (Proof Key for Code Exchange) — prevents authorization code interception
- State parameter with expiration to prevent CSRF attacks
- HTTP-only cookies for session management
- Nonce validation for ID token replay protection

### API Security
- CORS middleware configured
- Role-based access control (user/admin roles)
- Dependency injection for auth checks (`get_current_user`, `get_admin_user`)
- SQL injection prevention via SQLAlchemy ORM parameterized queries
- Input validation via Pydantic schemas

### Frontend Security
- Cloudinary uses unsigned upload preset (limited to specific transformations)
- Edit mode password stored in localStorage (not cryptographically secure — acceptable for CMS-level access)
- No sensitive data exposed in client-side code

### Known Security Considerations
- Edit mode password (`eam2024`) is hardcoded in frontend source — should be moved to environment variable or replaced with proper RBAC
- Cloudinary unsigned upload preset allows anyone with the preset name to upload — acceptable for admin-only usage
- `withCredentials: true` on all API calls — ensures cookies are sent cross-origin

---

## 26. Logging and Error Handling

### Backend Logging
- **Framework:** Python `logging` module
- **Log Directory:** `app/backend/logs/`
- **File Format:** `app_YYYYMMDD_HHMMSS.log`
- **Log Format:** `%(asctime)s - %(name)s - %(levelname)s - %(message)s`
- **Handlers:** File handler + Console handler (disabled in Lambda)
- **Levels:** DEBUG for development, INFO for production

### Frontend Error Handling
- Toast notifications via Sonner for user-facing errors
- Console logging for development debugging
- Try/catch blocks around all async operations
- Graceful fallbacks (e.g., Cloudinary → IndexedDB)

### Backend Error Handling
- FastAPI exception handlers for HTTP errors
- SQLAlchemy exception handling (DuplicateTable, UniqueViolation)
- Async session error handling with automatic rollback
- Structured error responses via HTTPException

---

## 27. Current Limitations

1. **Edit Mode Security:** Password is hardcoded in frontend JavaScript — visible in browser source
2. **No Real-time Collaboration:** Multiple admins editing simultaneously may overwrite each other's changes
3. **No Version History:** Edits overwrite previous values without undo/revision tracking
4. **IndexedDB Browser Dependency:** Local media cache is browser-specific and not shared across devices
5. **No Image Optimization Pipeline:** Images uploaded at original resolution without server-side resizing
6. **Single Language:** UI is Arabic-only with no i18n framework for multi-language support
7. **No Automated Testing:** No unit tests, integration tests, or E2E tests in the codebase
8. **Blog Content:** Requires markdown files in a `seo/content/` directory that doesn't currently exist
9. **Social Links:** Footer social links stored in localStorage, not synced to database

---

## 28. Known Issues

1. **Social Links Storage Inconsistency:** Footer social links use localStorage (`social-media-links` key) while the database has a `social_links` table — these are not synchronized
2. **Page Background Persistence:** Page backgrounds stored in localStorage, not in the database `site_pages` table
3. **Custom Navigation Links:** Stored in localStorage via PageManager, not synced with `navigation_items` database table
4. **CDN Image Dependencies:** Homepage references images on `mgx-backend-cdn.metadl.com` — if this CDN becomes unavailable, images will break
5. **Config Endpoint:** Frontend tries to fetch `/api/config` which may not exist as a dedicated endpoint, falling back to defaults

---

## 29. Technical Debt

1. **Dual Storage Systems:** Many features use both localStorage AND database, creating sync issues. Should consolidate to database-only.
2. **Hardcoded Admin Password:** `eam2024` in `EditModeContext.tsx` should be replaced with proper role-based access via the existing OIDC auth system.
3. **Unused Database Tables:** Several tables (`navigation_items`, `site_pages`, `site_settings`, `page_contents`) have corresponding backend CRUD but the frontend still uses localStorage for the same data.
4. **Mixed Arabic/English:** Code comments and variable names mix languages inconsistently.
5. **No TypeScript Strict Mode:** `noImplicitAny: false` and `strictNullChecks: false` reduce type safety.
6. **Large Logo File:** `logo.png` is 1.5MB — should be optimized/compressed.
7. **Console Debug Logs:** `config.ts` contains extensive `console.log` debug statements that should be removed for production.
8. **Unused Dependencies:** Some Radix UI components may be installed but unused.

---

## 30. Recommended Future Improvements

1. **Consolidate Storage:** Migrate all localStorage usage to database (social links, page backgrounds, navigation)
2. **Implement RBAC:** Replace hardcoded edit password with role-based access using existing `users.role` field
3. **Add Revision History:** Track edit history with timestamps and user attribution
4. **Image Optimization:** Add server-side image resizing/compression pipeline
5. **Add Testing:** Implement unit tests (Vitest), component tests (Testing Library), and E2E tests (Playwright)
6. **Enable TypeScript Strict Mode:** Gradually enable `strictNullChecks` and `noImplicitAny`
7. **Implement i18n:** Add English language support with a proper i18n framework
8. **Real-time Sync:** Add WebSocket support for real-time collaborative editing
9. **CDN Migration:** Host all images on Cloudinary instead of relying on platform CDN
10. **Performance Monitoring:** Add error tracking (Sentry) and analytics
11. **Compress Assets:** Optimize logo.png and other static assets
12. **Remove Debug Logging:** Clean up console.log statements in production builds

---

## 31. Dependencies on Atoms (If Any)

| Dependency | Component | Migration Impact |
|------------|-----------|-----------------|
| `@metagptx/web-sdk` | Frontend API client | **HIGH** — All backend communication uses this SDK. Must be replaced with direct Axios/fetch calls to your own API. |
| `@metagptx/vite-plugin-source-locator` | Vite plugin | **LOW** — Development tool only, can be removed without impact. |
| Atoms Cloud OIDC Provider | Authentication | **HIGH** — Must be replaced with another OIDC provider (Auth0, Keycloak, etc.) or custom auth. |
| Atoms Cloud Database | PostgreSQL hosting | **MEDIUM** — Standard PostgreSQL; migrate data and point `DATABASE_URL` to new host. |
| Atoms Cloud Object Storage | File storage | **MEDIUM** — Replace with S3, GCS, or similar. Update storage service endpoints. |
| Atoms Cloud AI Hub | AI chatbot | **MEDIUM** — Replace with direct OpenAI API calls or another AI provider. |
| `mgx-backend-cdn.metadl.com` | Static images | **LOW** — Download images and host on your own CDN/Cloudinary. |
| Lambda deployment via Atoms | Hosting | **MEDIUM** — Redeploy to your own AWS account or alternative hosting. |

---

## 32. Everything Required to Run This Project Completely Outside Atoms

### Frontend Requirements
1. Remove `@metagptx/web-sdk` dependency — replace with direct API calls using Axios
2. Remove `@metagptx/vite-plugin-source-locator` from Vite config
3. Remove `atoms()` plugin from Vite config
4. Update `src/lib/api.ts` to use Axios directly instead of `createClient()`
5. Update `src/components/AIChatbot.tsx` to call your own AI endpoint
6. Update `src/lib/dbService.ts` to use direct REST API calls
7. Download CDN images and host locally or on Cloudinary
8. Set up your own Cloudinary account (or keep existing one)

### Backend Requirements
1. Set up PostgreSQL database server
2. Configure OIDC provider (Auth0, Keycloak, or custom)
3. Set up object storage (AWS S3, MinIO, or similar)
4. Configure OpenAI API key for chatbot
5. Configure Stripe keys for payments
6. Deploy FastAPI application (Docker, EC2, ECS, or similar)
7. Set all environment variables listed in Section 17

### Infrastructure Requirements
1. PostgreSQL 14+ database server
2. Python 3.10+ runtime
3. Node.js 18+ (for frontend build)
4. Object storage service (S3-compatible)
5. OIDC identity provider
6. SSL certificate for HTTPS
7. Domain name and DNS configuration
8. CDN for static asset delivery (optional but recommended)

---

## 33. DNS and Domain Configuration

### Current Setup
- Domain managed by Atoms Cloud platform
- SSL termination handled at platform level
- API and frontend served from same domain (API under `/api` path)

### Migration Requirements
1. Register/transfer domain to your DNS provider
2. Configure A/CNAME records pointing to your hosting
3. Set up subdomain if separating frontend/backend (e.g., `api.yourdomain.com`)
4. Update CORS settings in backend to allow new domain
5. Update OIDC redirect URIs to new domain
6. Update Vite proxy configuration if using subdomains

---

## 34. SSL Certificate Configuration

### Current
- Managed automatically by Atoms Cloud platform

### Migration
- Use Let's Encrypt (free) with auto-renewal via certbot
- Or use AWS Certificate Manager if deploying to AWS
- Or use Cloudflare for DNS + SSL termination
- Ensure both frontend and backend endpoints have valid certificates
- Configure HSTS headers for security

---

## 35. CI/CD Workflow (If Any)

### Current
- No explicit CI/CD pipeline in the repository
- Deployment handled by Atoms Cloud platform on push

### Recommended Setup
```yaml
# Example GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: app/frontend/dist/

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r app/backend/requirements.txt
      - run: # Deploy to your hosting (Docker build, Lambda deploy, etc.)
```

---

## 36. Backup and Recovery Procedure

### Database Backup
```bash
# PostgreSQL dump
pg_dump -h <host> -U <user> -d <database> -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h <host> -U <user> -d <database> backup_20260707.dump
```

### Media Backup
- Cloudinary: Use Cloudinary Admin API to export all assets
- Object Storage: Sync bucket contents to local/S3 backup

### Code Backup
- Git repository is the source of truth
- Tag releases for version tracking

### Recommended Schedule
- Database: Daily automated backups with 30-day retention
- Media: Weekly full backup, daily incremental
- Code: Continuous via Git

---

## 37. Disaster Recovery Recommendations

1. **Database:** Set up PostgreSQL streaming replication to a standby server
2. **Multi-Region:** Deploy to at least 2 regions for high availability
3. **CDN Failover:** Use Cloudinary as primary with S3 as backup for static assets
4. **Monitoring:** Set up health check alerts (e.g., UptimeRobot, Pingdom)
5. **RTO Target:** < 1 hour for full recovery
6. **RPO Target:** < 15 minutes of data loss (with WAL archiving)
7. **Runbook:** Document step-by-step recovery procedures
8. **Regular Testing:** Perform disaster recovery drills quarterly

---

## 38. Data Migration Procedure

### From Atoms Cloud to Independent Infrastructure

#### Step 1: Export Database
```bash
# Connect to Atoms Cloud PostgreSQL and export
pg_dump -h <atoms-db-host> -U <user> -d <database> \
  --no-owner --no-privileges -F c -f eam_full_backup.dump
```

#### Step 2: Export Object Storage
```bash
# List and download all objects from site-media bucket
# Use the Atoms Cloud SDK or API to list and download files
```

#### Step 3: Export Cloudinary Assets
```bash
# Use Cloudinary Admin API
curl https://api.cloudinary.com/v1_1/dsta3yeml/resources/image \
  -u <api_key>:<api_secret> > cloudinary_assets.json
```

#### Step 4: Import to New Infrastructure
```bash
# Import database
pg_restore -h <new-host> -U <user> -d <new-database> eam_full_backup.dump

# Upload media to new storage (S3 example)
aws s3 sync ./exported-media/ s3://your-bucket/site-media/

# Run Alembic migrations to ensure schema is current
cd app/backend
alembic upgrade head
```

#### Step 5: Update Configuration
- Set new `DATABASE_URL`
- Configure new OIDC provider and update redirect URIs
- Update storage service to point to new S3/storage
- Update frontend environment variables
- Test all endpoints

---

## 39. Server Requirements

### Minimum Production Requirements
| Resource | Specification |
|----------|--------------|
| CPU | 2 vCPUs |
| RAM | 4 GB |
| Storage | 20 GB SSD (application + logs) |
| Database | PostgreSQL 14+ with 2 GB RAM, 10 GB storage |
| Network | 100 Mbps, public IP |
| OS | Ubuntu 22.04 LTS or Amazon Linux 2023 |

### Recommended Production Requirements
| Resource | Specification |
|----------|--------------|
| CPU | 4 vCPUs |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| Database | PostgreSQL 15+ with 4 GB RAM, 50 GB storage, automated backups |
| Network | 1 Gbps, load balancer |
| CDN | Cloudflare or CloudFront for static assets |

---

## 40. Local Development Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18+ | Frontend runtime |
| pnpm | 8+ | Frontend package manager |
| Python | 3.10+ | Backend runtime |
| pip | Latest | Python package manager |
| PostgreSQL | 14+ | Database (or use SQLite for local dev) |
| Git | 2.x | Version control |

### Optional
| Requirement | Purpose |
|-------------|---------|
| Docker | Containerized development |
| VS Code | Recommended IDE |
| pgAdmin | Database management GUI |

---

## 41. Production Server Requirements

### Option A: Traditional Server (VPS/EC2)
- Ubuntu 22.04 LTS
- Nginx as reverse proxy
- Supervisor/systemd for process management
- Let's Encrypt for SSL
- PostgreSQL on same or separate server

### Option B: Containerized (Docker/ECS)
- Docker 24+
- Docker Compose or ECS/EKS
- Managed PostgreSQL (RDS)
- Application Load Balancer
- ECR for container registry

### Option C: Serverless (Current Architecture)
- AWS Lambda for backend
- S3 + CloudFront for frontend
- RDS for PostgreSQL
- API Gateway for routing

---

## 42. Configuration Files and Purpose

| File | Purpose |
|------|---------|
| `app/frontend/vite.config.ts` | Vite bundler configuration, plugins, proxy, build optimization |
| `app/frontend/tailwind.config.ts` | Tailwind CSS theme, colors, animations, plugins |
| `app/frontend/tsconfig.json` | TypeScript compiler options and path aliases |
| `app/frontend/tsconfig.app.json` | App-specific TypeScript config |
| `app/frontend/tsconfig.node.json` | Node.js (build tools) TypeScript config |
| `app/frontend/postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| `app/frontend/eslint.config.js` | ESLint rules and plugins |
| `app/frontend/package.json` | Node.js dependencies and scripts |
| `app/frontend/.env` | Frontend environment variables (Cloudinary) |
| `app/backend/main.py` | FastAPI application entry point and middleware setup |
| `app/backend/lambda_handler.py` | AWS Lambda entry point (Mangum wrapper) |
| `app/backend/requirements.txt` | Python dependencies |
| `app/backend/alembic.ini` | Alembic migration configuration |
| `app/backend/core/config.py` | Backend settings (Pydantic BaseSettings) |
| `app/backend/core/database.py` | Database connection manager |
| `app/.mgx/config.yaml` | Platform configuration (DO NOT MODIFY) |

---

## 43. Estimated Deployment Process from Scratch

### Timeline: 2-4 hours for experienced DevOps engineer

#### Phase 1: Infrastructure Setup (30-60 min)
1. Provision PostgreSQL database (RDS or self-hosted)
2. Set up OIDC provider (Auth0: 15 min, Keycloak: 30 min)
3. Configure object storage (S3 bucket)
4. Set up server/container environment

#### Phase 2: Code Modifications (30-60 min)
1. Remove Atoms-specific dependencies (`@metagptx/web-sdk`, plugins)
2. Replace SDK calls with direct API calls (Axios)
3. Update authentication flow for new OIDC provider
4. Update storage service for new object storage

#### Phase 3: Deployment (30-60 min)
1. Build frontend: `pnpm run build`
2. Deploy frontend to CDN/S3
3. Deploy backend (Docker or Lambda)
4. Run database migrations: `alembic upgrade head`
5. Configure environment variables
6. Set up SSL and DNS

#### Phase 4: Verification (30 min)
1. Test all pages load correctly
2. Test authentication flow
3. Test edit mode functionality
4. Test media uploads
5. Test AI chatbot
6. Verify database operations

---

## 44. Recommended Migration Path from Atoms to Independent Infrastructure

### Phase 1: Preparation (Week 1)
- [ ] Export full database dump
- [ ] Download all Cloudinary assets inventory
- [ ] Export object storage contents
- [ ] Document all environment variables and their current values
- [ ] Set up new infrastructure (AWS/GCP/Azure)
- [ ] Set up new OIDC provider (Auth0 recommended for quick setup)

### Phase 2: Code Migration (Week 1-2)
- [ ] Fork/clone repository to your own Git hosting
- [ ] Remove `@metagptx/web-sdk` — replace with Axios REST client
- [ ] Remove `@metagptx/vite-plugin-source-locator`
- [ ] Remove `atoms()` plugin from Vite config
- [ ] Create new API client module (`src/lib/apiClient.ts`) with Axios
- [ ] Update all entity CRUD calls to use direct REST endpoints
- [ ] Update `AIChatbot.tsx` to call OpenAI directly or via your backend
- [ ] Update storage upload logic to use S3 presigned URLs
- [ ] Update OIDC configuration for new provider
- [ ] Update CORS settings for new domain

### Phase 3: Infrastructure Deployment (Week 2)
- [ ] Deploy PostgreSQL and import data
- [ ] Deploy backend (Docker on ECS/EC2 or Lambda)
- [ ] Deploy frontend (S3 + CloudFront or Nginx)
- [ ] Configure DNS and SSL
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

### Phase 4: Testing & Cutover (Week 2-3)
- [ ] Full regression testing on new infrastructure
- [ ] Performance testing
- [ ] Security audit
- [ ] DNS cutover (update A/CNAME records)
- [ ] Monitor for 48 hours
- [ ] Decommission Atoms deployment

---

## 45. Git Workflow and Branch Strategy (If Applicable)

### Current State
- No explicit branching strategy documented
- Development appears to be done on a single branch

### Recommended Strategy (GitFlow Lite)
```
main          ← Production-ready code
├── develop   ← Integration branch
├── feature/* ← New features
├── fix/*     ← Bug fixes
└── release/* ← Release preparation
```

### Recommended Practices
- Protect `main` branch (require PR reviews)
- Use conventional commits (`feat:`, `fix:`, `chore:`)
- Tag releases with semantic versioning (v1.0.0, v1.1.0)
- Squash merge feature branches

---

## Migration Checklist

### Pre-Migration
- [ ] Document all current environment variable values (securely)
- [ ] Export complete database dump (`pg_dump`)
- [ ] Inventory all Cloudinary assets (note: cloud name `dsta3yeml`)
- [ ] Export Atoms Cloud object storage contents
- [ ] Download all CDN-hosted images (`mgx-backend-cdn.metadl.com`)
- [ ] Record current OIDC configuration (client ID, issuer URL, redirect URIs)
- [ ] Test database dump can be restored successfully

### Infrastructure Setup
- [ ] Provision PostgreSQL 14+ database
- [ ] Set up OIDC provider (Auth0/Keycloak/Cognito)
- [ ] Create S3 bucket or equivalent for object storage
- [ ] Set up compute environment (EC2/ECS/Lambda)
- [ ] Configure CDN (CloudFront/Cloudflare)
- [ ] Obtain SSL certificate
- [ ] Configure DNS records
- [ ] Set up logging/monitoring (CloudWatch/Datadog)

### Code Changes
- [ ] Remove `@metagptx/web-sdk` from `package.json`
- [ ] Remove `@metagptx/vite-plugin-source-locator` from `package.json`
- [ ] Remove `atoms()` and `viteSourceLocator()` from `vite.config.ts`
- [ ] Rewrite `src/lib/api.ts` to export Axios instance
- [ ] Update `src/lib/dbService.ts` to use direct REST calls
- [ ] Update `src/components/AIChatbot.tsx` for direct API
- [ ] Update `src/lib/auth.ts` for new OIDC endpoints
- [ ] Update `src/lib/config.ts` to remove platform-specific logic
- [ ] Update backend `core/config.py` with new settings
- [ ] Update backend `routers/auth.py` for new OIDC provider
- [ ] Update backend `services/storage.py` for new object storage
- [ ] Remove `app/.mgx/` directory
- [ ] Update `index.html` favicon and meta tags

### Data Migration
- [ ] Import database dump to new PostgreSQL
- [ ] Run `alembic upgrade head` to verify schema
- [ ] Upload media files to new object storage
- [ ] Verify Cloudinary assets are accessible (same account)
- [ ] Update any hardcoded CDN URLs in database records
- [ ] Verify all image/video references resolve correctly

### Deployment
- [ ] Build frontend: `cd app/frontend && pnpm install && pnpm run build`
- [ ] Deploy frontend static files to CDN/S3
- [ ] Deploy backend application
- [ ] Set all environment variables
- [ ] Verify health check endpoint responds
- [ ] Test OIDC login flow end-to-end
- [ ] Test inline editing with database persistence
- [ ] Test Cloudinary uploads
- [ ] Test AI chatbot responses
- [ ] Test contact form submission
- [ ] Test consultation request

### Post-Migration
- [ ] Update DNS to point to new infrastructure
- [ ] Monitor error rates for 48 hours
- [ ] Verify all pages render correctly
- [ ] Test on mobile devices
- [ ] Set up automated backups
- [ ] Set up uptime monitoring
- [ ] Document new deployment procedures
- [ ] Decommission Atoms deployment

---

## Knowledge Transfer

### Design Decisions

1. **Inline Edit Mode Over Traditional CMS:** The project deliberately chose an inline editing approach where admins edit content directly on the live page rather than through a separate admin dashboard. The `/admin` route simply activates edit mode and redirects to homepage.

2. **Dual Storage Strategy:** Media uploads attempt Cloudinary first (for CDN delivery and persistence), falling back to IndexedDB for offline/local scenarios. This was chosen because Cloudinary provides permanent URLs while IndexedDB is browser-local.

3. **Stable Element Keys:** The inline editing system uses `data-editable-id` attributes for stable element identification. Without this, DOM changes would break edit associations. The fallback key generation uses tag + content hash.

4. **Password-Based Edit Mode:** A simple password (`eam2024`) was chosen over full OIDC-gated editing for faster admin access. The OIDC system exists but is separate from edit mode.

5. **Arabic-First Design:** The entire UI is designed RTL (right-to-left) with Arabic as the primary language. All navigation labels, content, and the AI chatbot system prompt are in Arabic.

6. **Theme System:** Dark mode uses medium gray (`#5E5E5E`) backgrounds with white cards, not pure black. This was a specific design choice based on user reference images.

7. **IndexedDB for Large Media:** localStorage has a 5MB limit, so all media (images, videos, page data) uses IndexedDB which has no practical size limit.

### Implementation Conventions

1. **File Naming:** Models use snake_case matching table names (e.g., `site_edits.py` → table `site_edits`)
2. **API Prefix:** All backend routes use `/api/v1/` prefix
3. **Entity Routes:** Auto-generated CRUD at `/api/v1/entities/{table_name}`
4. **Component Organization:** Page components in `src/pages/`, reusable components in `src/components/`
5. **State Management:** Server state via TanStack Query, local UI state via React Context
6. **Error Handling:** Toast notifications for user-facing errors, console.error for debugging

### Hidden Dependencies

1. **`content.json`:** Located at `public/content.json` — may be used by some components for initial content loading
2. **localStorage Keys:**
   - `eam-theme` — Current theme (dark/light)
   - `edit_mode_authenticated` — Edit mode auth state
   - `social-media-links` — Social media URLs (JSON)
   - `page-bg-{pathname}` — Page background settings (JSON)
   - Various `custom-nav-*` keys for navigation management
3. **IndexedDB Databases:**
   - `inline-edits-db` — Media blobs for inline edits
   - `page-backgrounds-db` — Video files for page backgrounds
   - `app-data-db` — Page data (projects, team members, investments)
4. **CDN Images:** Homepage references `mgx-backend-cdn.metadl.com` for service images — these will break if the CDN is unavailable

### Workarounds

1. **Config Loading Race Condition:** `main.tsx` loads runtime config before rendering to avoid stale environment variables. The `configLoading` flag prevents using default values during async load.
2. **Lambda Cold Start:** Database uses lazy initialization (`ensure_initialized()`) because Lambda lifespan events may not fire reliably.
3. **Double Rollback Prevention:** Database session management avoids manual rollback in error handlers because AsyncSession's context manager already handles it.
4. **Vite Proxy:** In development, `/api` requests are proxied to port 8000 to avoid CORS issues. In production, both frontend and backend are served from the same domain.
5. **Blog Static Pages:** Blog pages use a `<meta>` tag to skip React hydration, serving as pure static HTML for SEO crawlers.

### Engineering Notes

1. **Auto-Generated Backend Code:** Models, routers, and services under `backend/models/`, `backend/routers/`, and `backend/services/` are auto-generated from JSON schema definitions. Manual edits to these files may be overwritten.
2. **Alembic Migrations:** The `alembic/` directory contains migration scripts. Always run `alembic upgrade head` after schema changes.
3. **Table Repair System:** `DatabaseManager.check_and_repair_existing_tables()` automatically adds missing columns to existing tables — useful for schema evolution without full migrations.
4. **Chunk Size Warning:** Build output may show chunk size warnings for the UI vendor bundle (all Radix components). This is acceptable and configured with a 1000KB limit.
5. **Prerender Skip:** The `postinstall` script just echoes success — no actual post-install processing needed.

---

## Additional Information

### Company Information (For Context)
- **Company:** إعمار الأصالة والمعاصرة للاستشارات الهندسية (EAM Engineering Consultancy)
- **Location:** Saudi Arabia
- **Industry:** Engineering Consultancy
- **Services:** Architectural design, project management, feasibility studies, interior design, infrastructure, environmental consulting, urban planning, surveying

### Cloudinary Account Details
- **Cloud Name:** `dsta3yeml`
- **Upload Preset:** `dsta3yeml` (unsigned)
- **Note:** This is the project's own Cloudinary account. All uploaded media is stored here permanently. The account credentials (API key/secret) are needed for admin operations but not for unsigned uploads.

### AI Chatbot Configuration
- The chatbot uses a detailed Arabic system prompt with company information
- It's configured to answer questions about EAM's services, team, and capabilities
- Uses the Atoms Cloud AI hub which proxies to OpenAI — must be replaced with direct OpenAI calls after migration

### Payment System
- Stripe integration exists in `services/payment.py` and `routers/payments.py` (if present)
- Payment routes: `/create_payment_session` and `/verify_payment`
- Currently used for investment/project payment flows

### Contact & Digital Business Card
- `/contact-card` provides a downloadable vCard with company contact info
- Includes QR code generation, social media links, and share functionality
- Reads social links from localStorage (same key as footer)

### Monitoring Recommendations
- Set up health check on `/api/v1/health` endpoint
- Monitor database connection pool utilization
- Track Cloudinary upload success/failure rates
- Monitor Lambda cold start times if using serverless
- Set up alerts for 5xx error rate spikes

---

*Document generated: 2026-07-07*
*Last updated by: Engineering Team*
*Version: 1.0*