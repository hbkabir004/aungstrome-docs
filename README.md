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

### Technical Features
- **Offline-First**: PWA with service worker for offline access
- **Client-Side Storage**: IndexedDB (default) or LocalStorage
- **Dark/Light Theme**: System-aware theme with manual toggle
- **Responsive Design**: Works on desktop and mobile devices
- **Markdown Rendering**: Full GitHub Flavored Markdown support with syntax highlighting
- **Interactive Code Previews**: Sandboxed React component execution

## Getting Started

### Prerequisites
- Node.js 18+ or compatible package manager (npm, yarn, pnpm)

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

3. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Deploy with default settings

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted with Node.js

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
│   └── markdown-renderer.tsx
├── lib/                     # Core logic
│   ├── types.ts            # TypeScript types
│   ├── storage/            # Storage implementations
│   │   ├── indexeddb.ts   # IndexedDB wrapper
│   │   ├── localstorage.ts # LocalStorage wrapper
│   │   └── index.ts       # Storage abstraction
│   ├── search.ts           # Fuse.js search logic
│   ├── seed-data.ts        # Initial sample data
│   └── init-data.ts        # Data initialization
├── hooks/                   # Custom React hooks
│   └── use-data.ts         # SWR data fetching hooks
└── public/                  # Static assets
    ├── manifest.json        # PWA manifest
    └── icons/              # App icons
\`\`\`

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first styling
- **IndexedDB (idb)**: Client-side database
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

### Limitations

- Code previews cannot make network requests
- No server-side code execution
- Limited to browser-available APIs
- Sandpack bundle size adds ~2MB to initial load

## Future Enhancements

### Planned Features
- GitHub Gist sync for backup
- Google Drive integration
- Keyboard shortcuts (Cmd/Ctrl+K for search, etc.)
- Drag-and-drop reordering
- Bulk operations (delete multiple items)
- Tag management UI
- Deep linking to specific items
- Export to PDF or Markdown

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

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [v0](https://v0.dev) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Code previews powered by [Sandpack](https://sandpack.codesandbox.io)
- Icons from [Lucide](https://lucide.dev)
