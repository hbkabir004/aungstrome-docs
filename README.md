# Aungstrome Docs - Interview Preparation App

A personal documentation app for interview preparation built with Next.js, TypeScript, and Tailwind CSS. Store Q&A items, code snippets with interactive previews, and organize everything by topics—all running entirely in your browser with offline support.

## Features

### Core Functionality
- **Topics Organization**: Create topics to categorize your interview preparation materials
- **Q&A Management**: Store questions and answers with Markdown support
  - Difficulty levels (Easy, Medium, Hard)
  - Tags for organization
  - YouTube video links with timestamps
  - Personal notes section
- **Code Snippets**: Save and preview code with interactive execution
  - Support for React TSX/JSX, JavaScript, HTML, CSS, and CSS-in-JS
  - Interactive previews using Sandpack for React components
  - Revision history (up to 50 revisions per snippet)
  - Copy to clipboard functionality
- **Advanced Search**: Fuzzy search across all content using Fuse.js
  - Filter by topic, type, difficulty, and language
  - Sort by relevance, date, or alphabetically
- **Data Management**: 
  - Export/import data as JSON
  - Switch between IndexedDB and LocalStorage
  - Clear all data option
  - **Google Drive Sync**: Automatic backup and synchronization to your personal Google Drive

### Technical Features
- **Offline-First**: PWA with service worker for offline access
- **Client-Side Storage**: IndexedDB (default) or LocalStorage
- **Cloud Backup**: Secure Google Drive integration with OAuth 2.0
- **Dark/Light Theme**: System-aware theme with manual toggle
- **Responsive Design**: Works on desktop and mobile devices
- **Markdown Rendering**: Full GitHub Flavored Markdown support with syntax highlighting
- **Interactive Code Previews**: Sandboxed React component execution

## Getting Started

### Prerequisites
- Node.js 18+ or compatible package manager (npm, yarn, pnpm)
- (Optional) Google Cloud Project for Google Drive sync

### Installation

1. Clone or download this project
2. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. (Optional) Configure Google Drive API:
   - Copy `.env.local.example` to `.env.local`
   - Follow the Google Drive Setup section below
   - Add your credentials to `.env.local`

4. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Google Drive Setup (Optional)

To enable Google Drive sync:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Add authorized redirect URIs (same as origins)
   - Click "Create"
5. Create an API Key:
   - Click "Create Credentials" → "API Key"
   - (Optional) Restrict the key to Google Drive API
6. Copy credentials to `.env.local`:
   \`\`\`
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
   \`\`\`

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in project settings:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_API_KEY`
4. Deploy with default settings

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted with Node.js

**Important:** Add the production URL to Google Cloud Console authorized origins and redirect URIs.

## Usage Guide

### Creating Topics

1. Click "New Topic" on the home page
2. Enter a name and optional description
3. Topics help organize your Q&A items and snippets

### Adding Q&A Items

1. Navigate to a topic and click "New Q&A"
2. Fill in the title, question, and answer using Markdown
3. Set difficulty level and add tags
4. Optionally add YouTube links and personal notes
5. Use the live preview to see formatted content

### Creating Code Snippets

1. Navigate to a topic and click "New Snippet"
2. Choose the language/format
3. Paste or write your code
4. For React TSX/JSX, see live interactive preview
5. Revisions are automatically saved when you edit

### Searching

1. Use the Search page to find content across all topics
2. Apply filters for topic, type, difficulty, or language
3. Sort results by relevance, date, or alphabetically

### Google Drive Sync

**Connecting:**
1. Go to Settings → Google Drive Sync
2. Click "Connect Google Drive"
3. Sign in with your Google account
4. Grant permissions (only accesses the backup file)
5. Initial sync will merge local and cloud data

**Automatic Sync:**
1. Enable "Automatic Sync" toggle
2. Choose sync interval (15 min to 6 hours)
3. Data syncs automatically in the background

**Manual Operations:**
- **Sync Now**: Merges local and cloud data, keeping latest versions
- **Upload Backup**: Overwrites cloud with current local data
- **Restore Backup**: Replaces local data with cloud backup

**How Sync Works:**
- Merge strategy: Keeps items with latest `updatedAt` timestamp
- Conflict resolution: Automatic based on modification time
- Privacy: Data stored in your personal Google Drive only
- Security: OAuth 2.0 authentication, no third-party access

**Disconnecting:**
1. Click the disconnect icon
2. Confirm disconnection
3. Local data remains intact
4. Cloud backup remains in your Google Drive

### Import/Export

**Export:**
1. Go to Settings
2. Click "Export Data (JSON)"
3. Save the JSON file as backup

**Import:**
1. Go to Settings
2. Click "Import Data (JSON)"
3. Select your backup JSON file
4. Data will be merged with existing content

### Storage Backend

**IndexedDB (Default):**
- Better performance
- Larger storage capacity
- Recommended for most users

**LocalStorage (Fallback):**
- Simpler implementation
- Size limitations (~5-10MB)
- Useful for debugging or compatibility

Change in Settings → Storage Backend

## Architecture

### Project Structure

\`\`\`
aungstrome-docs/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page with topics
│   ├── search/              # Search page
│   ├── settings/            # Settings page
│   ├── snippets/            # All snippets view
│   └── topics/[topicId]/    # Topic-specific pages
│       ├── qa/              # Q&A items for topic
│       └── snippets/        # Snippets for topic
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── theme-provider.tsx   # Theme management
│   ├── nav-header.tsx       # Navigation
│   ├── qa-*.tsx            # Q&A components
│   ├── snippet-*.tsx       # Snippet components
│   ├── google-drive-sync.tsx # Google Drive UI
│   └── markdown-renderer.tsx
├── lib/                     # Core logic
│   ├── types.ts            # TypeScript types
│   ├── storage/            # Storage implementations
│   │   ├── indexeddb.ts   # IndexedDB wrapper
│   │   ├── localstorage.ts # LocalStorage wrapper
│   │   ├── settings.ts    # Settings storage
│   │   └── index.ts       # Storage abstraction
│   ├── google-drive.ts     # Google Drive API integration
│   ├── search.ts           # Fuse.js search logic
│   ├── seed-data.ts        # Initial sample data
│   └── init-data.ts        # Data initialization
├── hooks/                   # Custom React hooks
│   ├── use-data.ts         # SWR data fetching hooks
│   └── use-google-drive-sync.ts # Google Drive sync hook
└── public/                  # Static assets
    ├── manifest.json        # PWA manifest
    └── icons/              # App icons
\`\`\`

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first styling
- **IndexedDB (idb)**: Client-side database
- **Google Drive API**: Cloud backup and sync
- **Fuse.js**: Fuzzy search
- **Sandpack**: Interactive code previews
- **react-markdown**: Markdown rendering
- **rehype-highlight**: Syntax highlighting
- **SWR**: Data fetching and caching
- **next-pwa**: Progressive Web App support

## Security & Sandboxing

### Code Preview Security

**Sandpack (React TSX/JSX):**
- Runs in isolated iframe with sandbox attributes
- No network access by default
- Limited to client-side browser APIs
- Cannot access parent page or user data

**Static Previews (HTML/CSS/JS):**
- HTML is sanitized before rendering
- No script execution for non-React code
- Safe for viewing but not interactive

### Data Security

- All data stored locally in browser
- No server-side storage or transmission
- Export/import uses local file system only
- No authentication required (single-user app)

### Google Drive Security

- **OAuth 2.0**: Industry-standard authentication
- **Scoped Access**: Only accesses the backup file created by the app
- **No Third-Party Access**: Data never shared with external services
- **Encrypted Storage**: Google Drive provides encryption at rest
- **Token Management**: Access tokens stored locally, expire automatically
- **Privacy First**: Your data remains in your personal Google Drive

## Future Enhancements

### Planned Features
- GitHub Gist sync for backup
- Keyboard shortcuts (Cmd/Ctrl+K for search, etc.)
- Drag-and-drop reordering
- Bulk operations (delete multiple items)
- Tag management UI
- Deep linking to specific items
- Export to PDF or Markdown
- Conflict resolution UI for manual merge

### Contributing

This is a personal project template. Feel free to fork and customize for your needs.

## Troubleshooting

**Data not persisting:**
- Check browser storage settings
- Try switching storage backend in Settings
- Export data before clearing browser cache

**Sandpack preview not working:**
- Check browser console for errors
- Ensure code is valid React/TypeScript
- Try refreshing the page

**Import fails:**
- Verify JSON file format matches export structure
- Check for syntax errors in JSON
- Ensure file contains topics, qaItems, and snippets arrays

**Google Drive sync issues:**
- Check if access token expired (reconnect if needed)
- Verify environment variables are set correctly
- Ensure Google Drive API is enabled in Cloud Console
- Check authorized origins match your deployment URL
- Look for errors in browser console

**"Access token expired" error:**
- Click disconnect and reconnect Google Drive
- Tokens expire after ~1 hour for security
- Reconnecting generates a new token

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Client ID for Drive sync |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Optional | Google API Key for Drive API access |

**Note:** Google Drive sync is optional. The app works fully without these variables.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [v0](https://v0.dev) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Code previews powered by [Sandpack](https://sandpack.codesandbox.io)
- Icons from [Lucide](https://lucide.dev)
- Google Drive API for cloud sync
