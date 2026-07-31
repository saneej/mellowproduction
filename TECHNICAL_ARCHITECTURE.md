# Mellow Production Architecture & Development Manual

## Overview
**Mellow Production Studio & Client Galleries** is a commercial-grade, full-stack React and Firebase application built for high-end photography and video production studios.

The architecture emphasizes **lightning-fast client browsing**, **zero unnecessary API overhead**, **durable Firestore persistence**, and **extensible storage providers**.

---

## 1. Directory & Codebase Architecture

```
/
├── server.ts                       # Express + Vite SSR / API fallback server
├── firestore.rules                 # Deployed Firebase Security Rules
├── firebase-applet-config.json     # Provisioned Firestore Database configuration
├── public/
│   ├── manifest.json               # Progressive Web App (PWA) Manifest
│   └── icons...
├── src/
│   ├── main.tsx                    # Entry Point
│   ├── App.tsx                     # Main Router, Providers & Command Palette
│   ├── index.css                   # Global Tailwind CSS System
│   ├── constants/                  # Centralized Constants & Configurations
│   │   └── index.ts
│   ├── contexts/                   # Global State & Context Providers
│   │   ├── AuthContext.tsx         # Auth & Role-based Permissions
│   │   └── ThemeContext.tsx        # Light / Dark / System Theme System
│   ├── hooks/                      # Custom Reusable Hooks
│   │   ├── useProjects.ts          # Project listing & filter logic
│   │   └── useGallery.ts           # Gallery media, sorting & selection
│   ├── lib/                        # Security, Validation & Helpers
│   │   ├── rateLimiter.ts          # Rate limiter for PINs & Auth
│   │   ├── validation.ts           # Zod schema validators
│   │   └── utils.ts                # Utility functions
│   ├── services/                   # Service & Repository Layer
│   │   ├── dbService.ts            # Firestore DB CRUD operations
│   │   ├── driveService.ts         # Google Drive URL Resolver
│   │   ├── syncEngine.ts           # Background Drive Sync Engine
│   │   └── storage/                # Storage Provider Abstraction Layer
│   │       ├── IStorageProvider.ts # Interface for Storage Providers
│   │       └── GoogleDriveProvider.ts
│   ├── components/
│   │   ├── ui/                     # Reusable UI Component Library (Buttons, Skeletons, States)
│   │   ├── common/                 # Layouts, Header, Command Palette, Toast, Offline Banner
│   │   ├── admin/                  # Admin Dashboard Tabs & Modals
│   │   └── gallery/                # Public & Client Gallery views, Lightbox, PIN Modal
│   ├── pages/                      # Page Level Views
│   │   ├── MainWebsite.tsx         # Public Studio Portfolio & Website
│   │   ├── AdminDashboardPage.tsx  # Admin Dashboard
│   │   ├── ProjectPage.tsx         # Client Project Landing Page
│   │   └── GalleryPage.tsx         # Interactive Media Gallery Page
│   └── types/                      # Strict TypeScript Interfaces
│       └── gallery.ts
```

---

## 2. Storage Provider Abstraction Layer

To ensure the application is ready for future storage expansions (such as AWS S3, Cloudflare R2, Dropbox, or Bunny Storage), all storage operations are decoupled via the `IStorageProvider` interface:

```typescript
import { IStorageProvider } from './services/storage/IStorageProvider';
import { googleDriveStorage } from './services/storage/GoogleDriveProvider';

// Example usage to swap or use storage providers:
const currentProvider: IStorageProvider = googleDriveStorage;
const thumbnailUrl = currentProvider.getThumbnailUrl(mediaId, 600);
```

---

## 3. Data Flow & Firebase Spark Plan Optimization

To operate efficiently within the Firebase Spark (Free) Plan:
1. **Drive Sync Engine**: Google Drive is synced once by the admin via `syncEngine.ts`. All folder hierarchies, file IDs, sizes, and thumbnails are cached as Firestore documents.
2. **Read Optimization**: Client gallery views read directly from cached Firestore documents using query limits and indexed fields.
3. **No Direct Drive Calls**: Clients never make raw calls to Google Drive APIs, preventing quota exhaustion and ensuring instant load times.

---

## 4. Security & Validation Standards

1. **Firestore Security Rules**: Rules strictly limit write operations to authenticated admins (`isAdmin()`), while granting public read access only to published projects.
2. **Client Rate Limiting**: PIN verification and access codes are protected against brute-force attacks via `rateLimiter.ts` (locking after 5 failed attempts for 5 minutes).
3. **Zod Validation**: All form inputs, access code submissions, project configurations, and client favorite submissions are validated server- and client-side via `src/lib/validation.ts`.

---

## 5. Future Extensibility Roadmap

The modular codebase is prepared for seamless extension without refactoring core components:

1. **AI Face Recognition & Search**: Hook into `media` metadata by adding `aiTags?: string[]` and `faces?: FaceDescriptor[]`.
2. **Album Builder & Selection**: Extend `favorites` collection to support client comments, cover photo picks, and export to Lightroom XML.
3. **Print Ordering & Payments**: Add Stripe or Razorpay API handlers to `/api/checkout` to allow clients to buy physical prints.
4. **Cloud Storage Providers**: Implement additional classes conforming to `IStorageProvider` (e.g. `AwsS3Provider`, `CloudflareR2Provider`).
