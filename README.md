# Modern Portfolio Website

A fully customizable, CMS-powered portfolio website built with Next.js 16, React 19, Firebase, and GSAP animations.

## ✨ Features

- **Real-time Editing**: Edit content directly on the website with inline editing
- **Firebase Backend**: All data stored in Firestore for easy management
- **Server-Side Rendering**: Fast initial page loads with SSR & Static Generation
- **Modern UI**: Glassmorphic cards, GSAP animations, and responsive design
- **Admin Panel**: Secure admin authentication with role-based access
- **Image Management**: Cloudinary integration for optimized image uploads
- **Type Safety**: Full TypeScript support
- **SEO Optimized**: Dynamic metadata and static generation for better SEO
- **Performance**: Client-side caching and prefetching for instant navigation

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4
- **Animations**: GSAP with ScrollTrigger
- **Backend**: Firebase (Firestore)
- **CMS**: [`better-content`](#-content-engine--better-content) — inline-edit engine (successor to `@dalgoridim/headless-cms`, extracted from this repo)
- **Images**: Cloudinary for optimization
- **Type Safety**: TypeScript

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project created
- Firebase Admin SDK credentials
- Cloudinary account (for image uploads)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd portfolio-2025
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

#### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Firebase Storage
5. Enable Email/Password and Google Authentication

#### 3.2 Get Firebase Credentials

**Client Credentials (Web App)**:
1. Go to Project Settings > General
2. Under "Your apps", click the Web icon (</>)
3. Register your app and copy the config

**Admin Credentials (Service Account)**:
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

#### 3.3 Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the variables:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Firebase Admin Config
FIREBASE_DB_URL="https://your-project.firebaseio.com"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_PROJECT_ID="your-project-id"

# Admin Access
ADMIN_EMAILS="your-email@example.com"

# Cloudinary Config
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Important**: For `FIREBASE_PRIVATE_KEY`, ensure:
- The key is wrapped in quotes
- Newlines are preserved as `\n`
- Don't modify the key structure

### 4. Seed the Database

Populate Firestore with initial data:

```bash
npm run seed
```

This creates collections for:
- Projects
- Experiences
- Skills
- Portfolio sections (banner, about, contact, stats, etc.)

### 5. Set Up Admin Access

After creating your account (via Google or Email), set yourself as admin:

```bash
npm run seed:admin your-email@example.com
```

**Important**: 
- Your email must match one in the `ADMIN_EMAILS` environment variable
- Log out and log back in for admin privileges to take effect

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧩 Content Engine — `better-content`

All inline editing is powered by **[`better-content`](https://www.npmjs.com/package/better-content)**,
a framework-neutral, database-agnostic, headless inline-edit engine that was
extracted from this project into its own standalone package. It supersedes
`@dalgoridim/headless-cms`, which this repo used through v0.10. The package ships **behavior only** — no
styling, no markup syntax, no icons. This portfolio supplies all of those as thin
"skin" wrappers, so the package can be reused by any app without inheriting this
site's look.

### How it's wired

| Concern | This repo | Package piece it skins / uses |
|---|---|---|
| Providers | `lib/context/PageContent.tsx` | `PageProvider` (+ Cloudinary storage, `sonner` notifier, `restTransport`) |
| Auth | `lib/context/auth.tsx` | `FirebaseAuthProvider` / `useCmsAuth` |
| Editable text | `components/customs/ContentEditSpan.tsx` | `ContentEditSpan` — adds the focus ring + the markup syntax via `renderValue` |
| Editable image | `components/customs/EditableImage.tsx` | `EditableImage` — adds the hover overlay, icons, and URL modal via its render-prop |
| Markdown editor | `components/customs/MarkdownEditor.tsx` | `useMarkdownEditor` — adds the modal, toolbar, and preview |
| Admin API route | `app/api/admin/firebase/[collection]/[id]/route.ts` | `createCmsHandlers` |
| Public reads | `app/api/content/route.ts`, `lib/cms/data.ts` | `createContentHandler` (allowlisted via `lib/cms/collections.ts`) / `DataAdapter.fetchById` |
| Server-side hydration | `app/(landing-page)/layout.tsx` | `loadItemMap` over the same `lib/cms/collections.ts` config → `PageProvider`'s `initialItems` |
| Data adapter | `lib/cms/server.ts` | `FirestoreDataAdapter` |

### Content model

Content uses the package's unified **item** model: every collection is an `Item[]`,
and a "section" (banner, about, contact, …) is a singleton item in the `portfolio`
collection addressed by a stable id. Components read via `usePageContext().items` /
`getItem`; addressing in the primitives is by `itemId`.

### Editing flow

1. The auth provider resolves the admin identity and toggles `isEditing`.
2. `ContentEditSpan` / `EditableImage` become editable in place; inline edits are
   buffered in `PageProvider` (via `editField`).
3. On save (`saveAll`), `PageProvider` uploads any pending images through the
   Cloudinary client adapter, then `PUT`s (upserts) each changed item to the admin
   route, which gates the request and writes through the `FirestoreDataAdapter`.
4. Add / remove / reorder use the immediate ops `createItem` / `deleteItem` /
   `reorderItems` (optimistic, with rollback on failure).

### Markup syntax

The inline rich-text syntax below is **defined in this repo** (the `renderValue`
parser in `components/customs/ContentEditSpan.tsx`), not in the package — see
[Markdown Support](#markdown-support).

> The package's own API (adapters, the `Query` language, relations, auth, the
> headless primitives) is documented in its own README under
> `Projects/Packages/headless-cms`.

## 📝 Usage Guide

### Editing Content

1. **Login**: Click the user icon (bottom right) and authenticate
2. **Enable Edit Mode**: Click the edit icon (bottom toolbar)
3. **Edit Inline**: Click on any text to edit
4. **Upload Images**: Click on images to replace them
5. **Save**: Changes auto-save on blur, or click Save All button

### Adding New Projects

Projects are managed in Firestore. You can:
1. Edit existing projects directly on the site
2. Add new projects via the "Add New Project" button (when logged in)
3. Use the seed script to bulk import

### Customizing Sections

All sections are editable via the CMS:
- **Banner**: Title, subtitle, and resume link
- **About**: Bio paragraphs and image
- **Stats**: Years of experience, projects completed, hackathons won
- **Projects**: Individual project cards with full content
- **Experience**: Work history with company details
- **Skills**: Technologies with proficiency levels
- **Contact**: Email, phone, location, and social links

### Markdown Support

Content supports special formatting:
- `**bold**` → **bold**
- `*italic*` → *italic*
- `~~strikethrough~~` → ~~strikethrough~~
- `^^primary color^^` → text in primary color
- `__underline__` → underlined text
- `~~br~~` → line break
- `[text](url)` → link

## ⚡ Performance Optimizations

### Static Generation
- All project pages are pre-generated at build time
- Instant page loads with `generateStaticParams`

### Client-Side Caching
- Projects are cached after first load
- Adjacent projects are prefetched for instant navigation
- Modal navigation is near-instant with cache

### Image Optimization
- Cloudinary integration for automatic optimization
- Lazy loading for off-screen images
- Proper image sizing and formats

## 🎨 Customization

### Theme Colors

Edit `app/globals.css` to customize your color scheme:

```css
:root {
  --primary: oklch(67.33% 0.19256 41.287); /* Your brand color */
  /* ... other colors */
}
```

### Fonts

Modify `app/layout.tsx` to use different fonts:

```typescript
const yourFont = YourFont({
  variable: "--font-your-font",
  subsets: ["latin"],
});
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Build Configuration**:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Environment variables
- Server-side rendering

## 🐛 Troubleshooting

### Hydration Errors

If you see hydration errors:
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run dev`

### Admin Access Issues

If admin privileges aren't working:
1. Verify you ran `npm run seed:admin`
2. Check email matches `ADMIN_EMAILS` in `.env.local`
3. Log out completely
4. Clear browser cookies
5. Log back in

### Firebase Connection Issues

Check that:
- All environment variables are correct
- Firestore rules allow read/write
- Service account has proper permissions

### Image Upload Failures

Ensure:
- Cloudinary credentials are correct
- File size is under 10MB for images
- Supported formats: PNG, JPG, GIF, WEBP, SVG

### Modal Not Closing

If the project modal won't close:
- Press ESC key
- Click outside the modal
- Click the X button in top right
- Check browser console for errors

## 📜 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run seed:admin` - Set user as admin
- `npm run lint` - Run ESLint

## 🔄 Recent Updates

### Performance Improvements
- ✅ Added client-side caching for instant modal navigation
- ✅ Implemented prefetching for adjacent projects
- ✅ Fixed modal close handlers (ESC + close button)
- ✅ Added `generateStaticParams` for static page generation

### SEO Enhancements
- ✅ Dynamic metadata for each project page
- ✅ Improved root layout metadata with Open Graph and Twitter cards
- ✅ Added structured data support

### UX Improvements
- ✅ Smooth modal transitions with GSAP
- ✅ Loading states for navigation
- ✅ Better keyboard navigation support

## 📄 License

MIT

## 🤝 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review error messages in console

## 🙏 Credits

Built with modern web technologies:
- Next.js team for the amazing framework
- Firebase for backend infrastructure
- GSAP for smooth animations
- Cloudinary for image optimization
- Vercel for hosting platform