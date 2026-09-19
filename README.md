# Profit As 

```markdown
profitas-frontend/
├── app/
│   ├── layout.tsx                    # Root: providers, fonts, globals
│   ├── globals.css                   # Tailwind + base styles
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login page (public)
│   └── (dashboard)/
│       ├── layout.tsx                # Auth guard + Sidebar + Header
│       ├── page.tsx                  # Dashboard / Overview
│       ├── properties/
│       │   ├── page.tsx              # List
│       │   └── [id]/
│       │       └── page.tsx          # Detail + GET LIQUIDITY
│       ├── liquidity/
│       │   └── page.tsx              # My liquidity requests
│       ├── users/
│       │   └── page.tsx              # Users (admin)
│       ├── partners/
│       │   └── page.tsx              # Partners
│       └── legal/
│           └── page.tsx              # Verifications + Compliance
│
├── components/
│   ├── ui/                           # Primitives (no logic)
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Input.tsx
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageHeader.tsx
│   └── features/
│       ├── PropertyCard.tsx
│       ├── StatusBadge.tsx
│       ├── LiquidityModal.tsx
│       ├── StatCard.tsx
│       └── ProtectedRoute.tsx
│
├── context/
│   └── AuthContext.tsx               # Real auth (backend-wired)
│
├── lib/
│   ├── api.ts                        # Axios instance + interceptors
│   ├── endpoints.ts                  # Typed endpoint map (optional)
│   └── format.ts                     # Currency, date, status helpers
│
├── hooks/                            # Optional (if time permits)
│   ├── useFetch.ts
│   └── useToast.ts
│
├── types/
│   └── index.ts                      # TS interfaces matching backend
│
├── .env.local                        # NEXT_PUBLIC_API_URL
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```  
