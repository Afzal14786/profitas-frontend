# PROFITAS — Real Estate Liquidity Ecosystem (Frontend)

> **"Property is valuable, but real-estate investment is often illiquid. PROFITAS builds the infrastructure that makes liquidity easier."**

This is the **frontend application** for PROFITAS, a real‑estate liquidity orchestration platform. It provides a clean, card‑based dashboard for managing properties, users, partners, and legal/compliance workflows—all centered around the core **GET LIQUIDITY** experience.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Axios**.

---

## 📖 Table of Contents

- [Business Context](#business-context)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features & Pages](#features--pages)
- [API Integration](#api-integration)
- [Authentication & Authorization](#authentication--authorization)
- [Component Library](#component-library)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Business Context

### Vision
PROFITAS is a **Real‑Estate Liquidity Infrastructure / Liquidity Network**. Its mission is to connect investors, buyers, institutional capital, lenders, property owners, and legal partners—making real‑estate‑linked investments easier to monetize.

**Core Idea:** *"PROFITAS connects real‑estate users, properties, partners and legal/compliance workflows around a central liquidity experience."*

### The Problem
Real‑estate investments are difficult to monetize due to limited buyers, long exit timelines, valuation challenges, legal friction, and lock‑ins.

### Three Liquidity Routes
1. **Secondary Marketplace** — Sell to other investors, HNIs, or institutions.
2. **Institutional Liquidity Network** — Curated opportunities for funds and institutions.
3. **Credit Against Eligible Asset** — Retain ownership while accessing credit from NBFCs/lenders.

### Dashboard Ecosystem Modules
The dashboard presents four core modules: **Users**, **Properties**, **Partners**, and **Legal & Compliance**—all feeding into the **GET LIQUIDITY** action.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **HTTP Client** | Axios (with interceptors) |
| **Icons** | Lucide React |
| **State Management** | React Context (Auth, Toast) |
| **Routing** | Next.js App Router (file‑based) |
| **Auth** | JWT (access + refresh tokens) stored in `localStorage` |

---

## Architecture Overview

The frontend is a **Next.js App Router** application with route groups for authentication and the main dashboard. It communicates with the PROFITAS backend via REST APIs.

```markdown
┌─────────────────────────────────────────────────────────┐
│ Browser (Next.js App)                                    │
│ ├── (auth)/       → Public routes (login/register)       │
│ ├── (dashboard)/  → Protected routes (auth guard)        │
│ └── api/          → Not used (external backend)          │
├─────────────────────────────────────────────────────────┤
│ Context Providers                                        │
│ ├── AuthContext   → User session, login/logout           │
│ └── ToastContext  → Success/error notifications          │
├─────────────────────────────────────────────────────────┤
│ API Layer (Axios)                                        │
│ ├── Request interceptor  → Attach Bearer token           │
│ └── Response interceptor → Auto-refresh on 401           │
├─────────────────────────────────────────────────────────┤
│ Backend API (localhost:8000/api/v1)                      │
│ ├── /auth    ├── /users    ├── /properties               │
│ ├── /partners├── /legal    ├── /liquidity                │
│ └── /dashboard                                           │
└─────────────────────────────────────────────────────────┘
```  

**Key architectural decisions:**
- **URL‑synced filters** on list pages (properties, users, partners, legal) — filters persist on refresh and are shareable.
- **Reusable UI primitives** (`Card`, `Button`, `Table`, `Modal`, `Input`, etc.) for consistency.
- **Role‑based UI gating** — admin‑only actions hidden for normal users.
- **Toast notifications** for all CRUD operations.
- **Mobile responsive** — sidebar collapses into a drawer on small screens.

---

## Project Structure

```markdown
profitas-frontend/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── globals.css                   # Tailwind v4 import + base styles
│   ├── not-found.tsx                 # Global 404 page
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Register page
│   └── (dashboard)/
│       ├── layout.tsx                # Auth guard + Sidebar + Header
│       ├── loading.tsx               # Route transition skeleton
│       ├── error.tsx                 # Error boundary
│       ├── page.tsx                  # Dashboard (Overview)
│       ├── profile/page.tsx          # Profile & change password
│       ├── properties/
│       │   ├── page.tsx              # Property list (filters, pagination)
│       │   └── [id]/page.tsx         # Property detail + GET LIQUIDITY
│       ├── liquidity/
│       │   ├── page.tsx              # My liquidity requests
│       │   ├── [id]/page.tsx         # Request detail
│       │   ├── marketplace/
│       │   │   ├── page.tsx          # Marketplace listings
│       │   │   └── [id]/page.tsx     # Listing detail + offers
│       │   └── credit/page.tsx       # Credit applications
│       ├── users/page.tsx            # Users (admin only)
│       ├── partners/
│       │   ├── page.tsx              # Partners grid
│       │   └── [id]/page.tsx         # Partner detail
│       └── legal/page.tsx            # Verifications & Compliance tabs
├── components/
│   ├── ui/                           # Primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MobileSidebar.tsx
│   │   └── Header.tsx
│   └── features/
│       ├── AdminOnly.tsx
│       ├── StatCard.tsx
│       ├── PropertyCard.tsx
│       ├── StatusBadge.tsx
│       ├── PropertyFormModal.tsx
│       ├── LiquidityModal.tsx
│       ├── UserDetailModal.tsx
│       ├── PartnerFormModal.tsx
│       ├── VerificationFormModal.tsx
│       ├── ComplianceFormModal.tsx
│       ├── DocumentsTab.tsx
│       ├── VerificationsTab.tsx
│       ├── ComplianceTab.tsx
│       └── ...
├── context/
│   ├── AuthContext.tsx               # User session, login/register/logout
│   └── ToastContext.tsx              # Global toast notifications
├── lib/
│   ├── api.ts                        # Axios instance + interceptors
│   └── format.ts                     # Currency, date, status helpers
├── types/
│   └── index.ts                      # All TypeScript interfaces
├── .env.local
├── next.config.ts
├── tailwind.config.ts                # (or v4 CSS config)
├── tsconfig.json
└── package.json
```  

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **PROFITAS Backend** running on `http://localhost:8000`

### 1. Clone the Repository

```bash
git clone https://github.com/Afzal14786/profitas-frontend.git frontend
cd frontend
```  

### 2. Install Dependencies  

```bash
npm install
```  

### 3. Configure Environment Variables  

Create a `.env.local` file in the project root:  

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```  
### 4. Start the Development Server  

```bash
npm run dev
```  
The app will be available at `http://localhost:3000`.  

### 5. Log In  
Use the demo credentials from the backend seed:  

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@profitas.dev | Password123 |
| Investor | user1@profitas.dev | Password123 |  

---  

# Features & Pages

## 🔐 Authentication

- Login page — email/password with demo credential hints.
- Register page — create a new investor account.
- JWT handling — tokens stored in localStorage; auto-refresh on 401.
- Route protection — dashboard layout redirects to /login if unauthenticated.

## 📊 Dashboard (Overview)

- Four stat cards — Users, Assets, Partners, Legal (from /dashboard/summary).
- Secondary metrics — Verified Properties, Pending Verifications, Active Liquidity Requests.
- Property preview — first 6 properties as cards with value, yield, and status badge.

## 🏢 Properties

- List page — table with filters (status, type, search), pagination, and URL-synced state.
- Add/Edit modals — create or update properties (name, location, value, yield, ownership).
- Detail page — full metrics + GET LIQUIDITY CTA (enabled only for verified properties).
- Status workflow — submit for verification (owner), mark verified/rejected (admin), archive.

## 💧 Liquidity (Core Feature)

- GET LIQUIDITY modal — two routes: SELL / MATCH (list for sale) or GET CREDIT (explore financing).
- My Requests — list of the user's liquidity requests with status badges.
- Request detail — shows listing or credit application details; cancel option.
- Marketplace — browse active listings; make offers on listings.
- Listing detail — view asking price, offers list, accept/reject (seller only).
- Credit Applications — list credit applications; admin can route to a lender, approve, reject, or mark disbursed.

## 👥 Users (Admin Only)

- Stats cards — Total, Active, Admins.
- User table — filters (search, role, status), pagination.
- User detail modal — edit name/role, deactivate/reactivate (self-deactivation blocked).

## 🤝 Partners

- Grid view — partner cards with type badge, contact info, services.
- Filters — by type, status, search.
- Detail page — full partner info; admin can edit or deactivate.
- Add/Edit modal — admin creates partners from partner-type organizations.

## ⚖️ Legal & Compliance

- Two tabs — Verifications and Compliance.
- Verifications table — filters, detail modal, admin create/edit.
- Compliance table — filters, stats card, detail modal, admin create/edit.
- Property detail tabs — Documents, Verifications, Compliance for a specific property.
- Documents — upload (PDF/JPG/PNG via Cloudinary), download, delete.

## 👤 Profile

- View/Edit name — PATCH /users/me.
- Change password — PATCH /users/me/password with current/new/confirm fields.  

---  

# API Integration

All API calls go through a central Axios instance (`lib/api.ts`) with:

- Base URL from `NEXT_PUBLIC_API_URL`.
- Request interceptor — attaches `Authorization: Bearer <accessToken>`.
- Response interceptor — on 401, attempts token refresh via `POST /auth/refresh`; if refresh fails, logs the user out.

## Endpoints Consumed

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` |
| Users | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password`, `GET /users`, `GET /users/stats`, `GET /users/:id`, `PATCH /users/:id`, `PATCH /users/:id/activate`, `DELETE /users/:id` |
| Properties | `GET /properties`, `GET /properties/:id`, `POST /properties`, `PATCH /properties/:id`, `DELETE /properties/:id`, `PATCH /properties/:id/status` |
| Organizations | `GET /organizations/me` (for property form dropdown) |
| Partners | `GET /partners`, `GET /partners/:id`, `POST /partners`, `PATCH /partners/:id`, `DELETE /partners/:id` |
| Liquidity | `POST /liquidity/requests`, `GET /liquidity/requests`, `GET /liquidity/requests/:id`, `PATCH /liquidity/requests/:id/status`, `GET /liquidity/listings`, `GET /liquidity/listings/:id`, `GET /liquidity/listings/:id/offers`, `POST /liquidity/listings/:id/offers`, `PATCH /liquidity/offers/:id`, `GET /liquidity/credit-applications`, `PATCH /liquidity/credit-applications/:id/route`, `PATCH /liquidity/credit-applications/:id/status` |
| Verifications | `GET /verifications`, `GET /verifications/:id`, `POST /verifications`, `PATCH /verifications/:id` |
| Compliance | `GET /compliance`, `GET /compliance/stats`, `GET /compliance/:id`, `POST /compliance`, `PATCH /compliance/:id` |
| Documents | `GET /documents`, `POST /documents` (multipart), `DELETE /documents/:id` |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/properties` |  

---  

# Authentication & Authorization

## Roles

The frontend distinguishes two roles: `user` (Investor) and `admin`.

| Feature | User | Admin |
|---------|------|-------|
| View dashboard, properties, partners, legal | ✅ | ✅ |
| Create property, submit for verification | ✅ | ✅ |
| Edit/archive own property | ✅ | ✅ |
| GET LIQUIDITY on verified property | ✅ | ✅ |
| Make offers on listings | ✅ | ✅ |
| View Users page | ❌ | ✅ |
| Manage users (edit, deactivate) | ❌ | ✅ |
| Mark property as verified/rejected | ❌ | ✅ |
| Manage partners (create, edit, deactivate) | ❌ | ✅ |
| Manage verifications & compliance | ❌ | ✅ |
| Route credit applications to lenders | ❌ | ✅ |

## UI Gating

- `AdminOnly` wrapper — renders children only for admins; shows an "Admin access required" card otherwise.
- Sidebar — hides the "Users" link for non-admins.
- Header — displays a role badge ("Admin" or "Investor").
- Action buttons — hidden based on `isAdmin` or ownership checks.  

---  

# Component Library

All reusable components live in `components/`:

## UI Primitives (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `Button` | Variants: primary, secondary, outline, ghost, danger; sizes: sm, md, lg; loading state |
| `Card` | White rounded container with border and shadow |
| `Input`, `Select`, `Textarea`, `FormField` | Form controls with labels and hints |
| `Table` (`TableWrapper`, `THead`, `Th`, `Tr`, `Td`) | Responsive table wrapper |
| `Modal` | Full-screen overlay with centered card; ESC to close |
| `ConfirmDialog` | Pre-built confirmation modal (used for deletes) |
| `Skeleton` | Pulsing placeholder for loading states |
| `EmptyState` | Icon + title + description + optional action |
| `ErrorBanner` | Red banner for displaying error messages |

## Feature Components (`components/features/`)

| Component | Used in |
|-----------|---------|
| `AdminOnly` | Users page, admin-only sections |
| `StatCard` | Dashboard, Users stats |
| `PropertyCard` | Dashboard preview, property list |
| `StatusBadge` | Everywhere a status is shown |
| `PropertyFormModal` | Create/edit property |
| `LiquidityModal` | GET LIQUIDITY flow |
| `UserDetailModal` | Users page |
| `PartnerFormModal` | Create/edit partner |
| `VerificationFormModal` | Create/edit verification |
| `VerificationDetailModal` | View verification |
| `ComplianceFormModal` | Create/edit compliance |
| `ComplianceDetailModal` | View compliance |
| `DocumentsTab` | Property detail |
| `VerificationsTab` | Property detail |
| `ComplianceTab` | Property detail |  

---  

# Environment Variables 

Create `.env.local` in the project root: 
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```  

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |  

# Available Scripts  

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server (port 3000) |
| `build` | `next build` | Build production bundle |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |  

---  

## License

ISC — see `package.json` for details.

## Author

Md Afzal Ansari — GitHub

> PROFITAS — Real-estate liquidity infrastructure that connects investors with buyers, institutional capital and credit providers so they can access liquidity from eligible real-estate-linked investments without PROFITAS having to buy every asset itself.  
