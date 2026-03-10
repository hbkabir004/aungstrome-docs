# 🚀 Aungstrome Docs — Interview Preparation App

A **personal documentation app** designed for structured **interview preparation**.
Built with **Next.js, TypeScript, and Tailwind CSS**, it allows you to organize knowledge, store Q&A, test code snippets with live previews, and keep everything **offline-first inside your browser**.

💡 Perfect for developers preparing for technical interviews.

---

# ✨ Features

## 📚 Core Functionality

### 🗂 Topics Organization

* Create topics to categorize interview materials
* Easily organize knowledge by subject

### ❓ Q&A Management

Store interview questions and answers with **Markdown support**

Features include:

* Difficulty levels → `Easy / Medium / Hard`
* Tags for organization
* YouTube video links with timestamps
* Personal notes section
* Live Markdown preview

---

### 💻 Code Snippets

Save and test code directly inside the app.

Supported languages:

* React (TSX / JSX)
* JavaScript
* HTML
* CSS
* CSS-in-JS

Features:

* ⚡ Interactive previews using **Sandpack**
* 🕘 Revision history (up to **50 revisions**)
* 📋 Copy-to-clipboard support
* 🧪 Safe sandbox execution

---

### 🔎 Advanced Search

Search across your entire knowledge base.

Powered by **Fuse.js fuzzy search**

Filters include:

* Topic
* Type (Q&A / Snippet)
* Difficulty
* Language

Sorting options:

* Relevance
* Date
* Alphabetical

---

### 💾 Data Management

Manage your data with built-in tools.

Features:

* Export / Import as **JSON**
* Switch between **IndexedDB** and **LocalStorage**
* Clear all stored data
* ☁ **Google Drive Sync**

Google Drive sync allows:

* Automatic backups
* Cross-device data synchronization

---

# ⚙ Technical Features

* ⚡ **Offline-First PWA**
* 💾 Client-side storage (IndexedDB / LocalStorage)
* ☁ Google Drive cloud backup
* 🌙 Dark / Light theme support
* 📱 Fully responsive design
* 📝 GitHub-flavored Markdown
* 🧪 Interactive code previews

---

# 🏁 Getting Started

## 📦 Prerequisites

* Node.js **18+**
* npm / yarn / pnpm

Optional:

* Google Cloud Project (for Drive sync)

---

# 📥 Installation

```bash
git clone <your-repository-url>

cd aungstrome-docs

npm install
# or
yarn install
# or
pnpm install
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# ☁ Google Drive Setup (Optional)

To enable **cloud backup and sync**:

### 1️⃣ Create a Google Cloud Project

Go to:

```
https://console.cloud.google.com
```

Create a new project.

---

### 2️⃣ Enable Google Drive API

Navigate to:

```
APIs & Services → Library
```

Search for:

```
Google Drive API
```

Click **Enable**.

---

### 3️⃣ Create OAuth Credentials

Go to:

```
APIs & Services → Credentials
```

Create:

```
OAuth Client ID
```

Type:

```
Web Application
```

Add authorized origins:

```
http://localhost:3000
https://yourdomain.com
```

---

### 4️⃣ Create an API Key

Create:

```
API Key
```

(Optional) Restrict to **Google Drive API**.

---

### 5️⃣ Configure Environment Variables

Create `.env.local`

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
```

---

# 🏗 Building for Production

```bash
npm run build
npm start
```

---

# 🚀 Deployment

## Recommended: Vercel

1. Push project to GitHub
2. Import project into **Vercel**
3. Add environment variables
4. Deploy

---

## Other Platforms

You can deploy to:

* Netlify
* Railway
* Render
* Self-hosted Node.js server

⚠ Make sure to add your **production URL** to Google OAuth settings.

---

# 📖 Usage Guide

## 🗂 Creating Topics

1. Click **New Topic**
2. Enter name + description
3. Organize interview materials by topic

---

## ❓ Adding Q&A

1. Open a topic
2. Click **New Q&A**
3. Write question and answer
4. Add tags and difficulty

Markdown preview is available.

---

## 💻 Creating Code Snippets

1. Open a topic
2. Click **New Snippet**
3. Select language
4. Write or paste code

React snippets show **live previews** automatically.

---

## 🔎 Searching Content

Go to **Search page**.

Apply filters:

* Topic
* Type
* Difficulty
* Language

Sort results by relevance or date.

---

# ☁ Google Drive Sync

## 🔗 Connecting

```
Settings → Google Drive Sync → Connect
```

Then sign in with your Google account.

Initial sync will merge **local + cloud data**.

---

## 🔄 Automatic Sync

You can enable background sync.

Available intervals:

* 15 minutes
* 30 minutes
* 1 hour
* 6 hours

---

## ⚙ Manual Sync Options

| Action         | Description                   |
| -------------- | ----------------------------- |
| Sync Now       | Merge local and cloud data    |
| Upload Backup  | Replace cloud with local data |
| Restore Backup | Replace local data with cloud |

---

## 🔐 Security

* OAuth 2.0 authentication
* Access limited to the backup file
* Data stays in your **Google Drive**
* No third-party storage

---

# 🏗 Project Architecture

```
aungstrome-docs
│
├── app
│   ├── search
│   ├── settings
│   ├── snippets
│   └── topics
│
├── components
│   ├── ui
│   ├── qa components
│   └── snippet components
│
├── lib
│   ├── storage
│   ├── google-drive integration
│   └── search logic
│
├── hooks
│
└── public
```

---

# 🧪 Key Technologies

| Technology      | Purpose               |
| --------------- | --------------------- |
| Next.js 15      | React Framework       |
| TypeScript      | Type-safe development |
| Tailwind CSS v4 | Styling               |
| IndexedDB       | Client database       |
| Fuse.js         | Fuzzy search          |
| Sandpack        | Code preview          |
| SWR             | Data caching          |
| next-pwa        | Offline support       |

---

# 🔐 Security & Sandboxing

## Sandpack Security

* Runs inside isolated iframe
* No network access
* Cannot access parent page

---

## Data Security

* All data stored **locally**
* No server-side storage
* Export / Import via files

---

# 🔮 Future Enhancements

Planned features:

* GitHub Gist sync
* Keyboard shortcuts
* Drag-and-drop reordering
* Bulk operations
* Tag management UI
* Export to PDF / Markdown
* Conflict resolution UI

---

# 🛠 Troubleshooting

### Data not persisting

* Check browser storage permissions
* Switch storage backend
* Export data before clearing cache

---

### Sandpack preview not working

* Check browser console
* Validate React code
* Refresh page

---

### Google Drive sync issues

* Reconnect if token expired
* Verify environment variables
* Check authorized origins

---

# 🌱 Environment Variables

| Variable                     | Required | Description     |
| ---------------------------- | -------- | --------------- |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | Optional | OAuth Client ID |
| NEXT_PUBLIC_GOOGLE_API_KEY   | Optional | Google API Key  |

The app **works fully offline** without these variables.

---

# 📄 License

MIT License
Free for personal or commercial use.

---
