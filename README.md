# Modern Portfolio Website

A fully customizable, CMS-powered portfolio website built with Next.js 16, React 19, Firebase, and GSAP animations.

## Features

- **Real-time Editing**: Edit content directly on the website with inline editing
- **Firebase Backend**: All data stored in Firestore for easy management
- **Server-Side Rendering**: Fast initial page loads with SSR
- **Modern UI**: Glassmorphic cards, GSAP animations, and responsive design
- **Admin Panel**: Secure admin authentication with role-based access
- **Image Management**: Firebase Storage integration for image uploads
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4
- **Animations**: GSAP with ScrollTrigger
- **Backend**: Firebase (Firestore + Storage + Auth)
- **Editor**: Slate.js for rich text editing
- **Type Safety**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project created
- Firebase Admin SDK credentials

## Setup Instructions

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
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

FIREBASE_DB_URL="https://your-project.firebaseio.com"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_PROJECT_ID="your-project-id"
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
- Portfolio sections (banner, about, contact, etc.)

### 5. Set Up Admin Access

After creating your account (via Google or Email), set yourself as admin:

```bash
npm run seed:admin your-email@example.com
```

**Important**: Log out and log back in for admin privileges to take effect.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Editing Content

1. **Login**: Click the user icon (bottom right) and authenticate
2. **Enable Edit Mode**: Click the edit icon (bottom toolbar)
3. **Edit Inline**: Click on any text to edit
4. **Upload Images**: Click on images to replace them
5. **Save**: Changes auto-save on blur

### Adding New Projects

Projects are managed in Firestore. You can:
1. Edit existing projects directly on the site
2. Add new projects via the Firebase Console
3. Use the seed script to bulk import

### Customizing Sections

All sections are editable via the CMS:
- **Banner**: Title and subtitle
- **About**: Bio paragraphs and image
- **Projects**: Individual project cards
- **Experience**: Work history and skills
- **Contact**: Contact information

### Markdown Support

Content supports special formatting:
- `**bold**` → **bold**
- `*italic*` → *italic*
- `~~strikethrough~~` → ~~strikethrough~~
- `^^primary color^^` → text in primary color
- `__underline__` → underlined text
- `~~br~~` → line break
- `[text](url)` → link

## Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Environment variables
- Server-side rendering

## Troubleshooting

### Hydration Errors

If you see hydration errors:
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run dev`

### Admin Access Issues

If admin privileges aren't working:
1. Verify you ran `npm run seed:admin`
2. Log out completely
3. Clear browser cookies
4. Log back in

### Firebase Connection Issues

Check that:
- All environment variables are correct
- Firestore rules allow read/write
- Service account has proper permissions

### Image Upload Failures

Ensure:
- Firebase Storage is enabled
- Storage rules allow authenticated writes
- File size is under 5MB

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run seed:admin` - Set user as admin
- `npm run lint` - Run ESLint

## License

MIT

## Support

For issues or questions, please open a GitHub issue.