# Requirements & Progress

## Requirements Overview
Redesign admin dashboard as an inline "Edit Mode" overlay on the actual website, allowing direct editing of all content (text, images, videos, sections) with add/delete capabilities and file upload support.

## Task Breakdown
- [x] Create EditMode context with authentication and toggle state
- [x] Create EditToolbar floating toolbar component
- [x] Create InlineEditable components (text, image, video, section)
- [x] Create FileUpload component with media-uploads bucket integration
- [x] Create PageManager for adding/removing pages
- [x] Create NavigationManager for managing nav items
- [x] Integrate edit mode into Layout component
- [x] Run lint and build checks

## Progress Log
- 2026-06-11: Admin dashboard created with 6 tabs, full CRUD, React Query, Arabic RTL UI
- 2026-06-11: Fixed admin access - removed OIDC auth requirement, added simple password gate
- 2026-06-12: Starting inline edit mode redesign per user request
- 2026-06-12: Simplified edit mode - removed complex toolbar, editing options now appear directly on each element on hover
- 2026-06-12: Added page background editor - admins can change each page's background to a color, image, or video
- 2026-06-12: Fixed edit mode toolbar positioning (fixed positioning with smart above/below placement)
- 2026-06-12: Improved text element detection to be more inclusive
- 2026-06-12: Fixed mouseout handling (300ms timeout + toolbar proximity check)
- 2026-06-12: Unified colors across pages (Contact page bg-gray-800 → bg-gray-50 in light mode)
- 2026-06-12: Invest page add/delete projects with localStorage persistence and admin edit mode integration
- 2026-06-12: Fixed video background persistence - videos now stored in IndexedDB instead of temporary blob URLs, ensuring they persist across page reloads
- 2026-06-12: Added social media icons to footer (Facebook, Instagram, X/Twitter, Snapchat, LinkedIn, TikTok, YouTube, Website) with editable links in admin edit mode
- 2026-06-12: Unified Careers and Invest page hero sections to match About/Contact consistent style
- 2026-06-12: Rewrote edit mode from hover-based toolbar to click-based editing - elements are now directly clickable to edit (no more disappearing toolbar)
- 2026-06-12: Fixed all 5 reported issues: (1) Dark mode changed to gray-only shades, (2) Edit toolbar repositioned below navbar, (3) Image/video persistence via IndexedDB, (4) Section add/delete management in edit mode, (5) Page management dialog added
- 2026-06-12: Dark mode updated to medium gray (#5E5E5E) background with white cards per user reference image
- 2026-06-12: PageManager simplified - removed path input, auto-generates path from timestamp, added fullscreen image/video upload for new pages
- 2026-06-12: Enhanced all three pages (Invest, Projects, Team) with full upload support: multi-image, video, and PDF file uploads in add forms
- 2026-06-12: Updated all hardcoded dark backgrounds across all pages to match new gray theme
- 2026-06-12: Fixed data persistence issue - switched all three pages (Invest, Projects, Team) from localStorage (5MB limit) to IndexedDB (unlimited) so uploaded media files are saved correctly
- 2026-06-12: Added Cloudinary cloud upload integration - files automatically upload to Cloudinary when configured (VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET), with graceful fallback to local base64/IndexedDB storage
- 2026-06-12: Cloudinary integration completed for all upload points: Invest, Projects, Team pages + PageBackgroundEditor component. Lint and build pass cleanly.
- 2026-06-13: Fixed inline edit persistence - replaced fragile DOM-path-based storage with stable data-editable-id system. Added retry logic for applySavedEdits(), Cloudinary-first media uploads, and data-editable-id attributes to all main pages (Index, About, Services, Contact, Careers).
- 2026-06-13: Database integration completed - created dbService.ts that persists all inline edits to backend site_edits table via web-sdk. Media uploads go to "site-media" object storage bucket. Includes migration from old localStorage edits. Removed localStorage dependency for edit persistence entirely.
- 2026-06-13: Created digital business card page (/contact-card) with company logo, phone, email, location, social media links grid, save contact (vCard download), and share button. Reads social links from same localStorage key as footer.
- 2026-09-04: M1 blockers - wrote app/.env with real OIDC_CLIENT_SECRET from runtime env; added .env rules to .gitignore. Found redirect_uri is derived from request headers (not env), so registered URI must match the value logged by [login]; Atoms OIDC client redirect registration cannot be done from the workspace.
- 2026-09-05: Measured get_dynamic_backend_url on localhost - plain uvicorn yields https://localhost:8000/api/v1/auth/callback (x-forwarded-proto defaults to https), LOCAL_PATCH=true yields http://localhost:3000/..., and http://localhost:8000/... only occurs when x-forwarded-proto=http is sent. Awaiting user decision: register https variant (no code change) vs minimal scheme fix.
- 2026-09-05: Applied both decisions - routers/auth.py now defaults scheme to http only for local hosts (localhost/127.0.0.1/0.0.0.0/::1/*.localhost) while x-forwarded-proto and remote hosts keep https; core/config.py loads app/.env then app/backend/.env at import time with override=False so normal uvicorn startup sees OIDC_CLIENT_SECRET; removed the duplicate debug-only loader from main.py. Verified: localhost -> http://localhost:8000/api/v1/auth/callback, proxy/Atoms hosts still https, secret loads without OS env.