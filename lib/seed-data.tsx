"use client"

// Seed data for first-time users
import type { AppData } from "./types"

export const seedData: AppData = {
  topics: [
    {
      id: "react-hooks",
      name: "React Hooks",
      description: "Understanding React Hooks and their use cases",
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 7,
    },
    {
      id: "nextjs-routing",
      name: "Next.js Routing",
      description: "App Router vs Pages Router and routing patterns",
      createdAt: Date.now() - 86400000 * 6,
      updatedAt: Date.now() - 86400000 * 6,
    },
    {
      id: "javascript",
      name: "JavaScript Fundamentals",
      description: "Core JavaScript concepts and patterns",
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
    {
      id: "css-basics",
      name: "CSS Basics",
      description: "CSS fundamentals and layout techniques",
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4,
    },
    {
      id: "html-semantics",
      name: "HTML Semantics",
      description: "Semantic HTML and accessibility",
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
    },
  ],
  qaItems: [
    {
      id: "qa-1",
      topicId: "react-hooks",
      title: "useMemo vs useCallback",
      question:
        "## When should you use useMemo vs useCallback?\n\nExplain the differences and provide examples of when to use each.",
      answer: `## Key Differences

**useMemo** memoizes a *computed value*, while **useCallback** memoizes a *function reference*.

### useMemo
Use when you have an expensive calculation that you don't want to re-run on every render:

\`\`\`jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
\`\`\`

### useCallback
Use when you need to pass a stable function reference to child components to prevent unnecessary re-renders:

\`\`\`jsx
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
\`\`\`

### When to Use Each
- **useMemo**: Expensive calculations, derived state, filtering/sorting large lists
- **useCallback**: Event handlers passed to memoized child components, dependencies in other hooks`,
      tags: ["react", "hooks", "performance", "optimization"],
      difficulty: "medium",
      youtubeLink: "https://www.youtube.com/watch?v=THL1OPn72vo",
      personalNotes:
        "Remember: premature optimization is the root of all evil. Only use these when you have a proven performance issue.",
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 2,
    },
    {
      id: "qa-2",
      topicId: "nextjs-routing",
      title: "App Router vs Pages Router",
      question: "## What are the key differences between Next.js App Router and Pages Router?",
      answer: `## App Router (app/)

The new App Router uses React Server Components by default and provides:

- **Server Components**: Components render on the server by default
- **Layouts**: Shared UI that doesn't re-render
- **Loading & Error States**: Built-in UI for loading and error handling
- **Streaming**: Progressive rendering with Suspense
- **Route Handlers**: API routes with \`route.ts\` files

\`\`\`tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
\`\`\`

## Pages Router (pages/)

The traditional Pages Router:

- **File-based routing**: Each file is a route
- **getServerSideProps/getStaticProps**: Data fetching methods
- **API Routes**: \`pages/api/\` directory
- **Client-side by default**: All components are client components

\`\`\`tsx
// pages/dashboard.tsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
\`\`\`

## Migration Considerations
- App Router is the future of Next.js
- Can use both routers in the same project during migration
- App Router has better performance with Server Components`,
      tags: ["nextjs", "routing", "app-router", "pages-router"],
      difficulty: "medium",
      createdAt: Date.now() - 86400000 * 6,
      updatedAt: Date.now() - 86400000 * 6,
    },
    {
      id: "qa-3",
      topicId: "javascript",
      title: "JavaScript Closures",
      question: "## What is a closure in JavaScript?",
      answer: `## Definition

A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.

## Example

\`\`\`javascript
function createCounter() {
  let count = 0;
  
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
\`\`\`

## Key Points

1. **Lexical Scoping**: Functions are executed using the scope chain that was in effect when they were defined
2. **Data Privacy**: Closures can create private variables
3. **Memory**: Closures keep references to outer variables, which can lead to memory leaks if not careful

## Common Use Cases
- Data privacy and encapsulation
- Event handlers and callbacks
- Partial application and currying
- Module pattern`,
      tags: ["javascript", "closures", "scope", "fundamentals"],
      difficulty: "medium",
      youtubeLink: "https://www.youtube.com/watch?v=3a0I8ICR1Vg",
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
    {
      id: "qa-flexbox-centering",
      topicId: "css-basics",
      title: "Flexbox Centering",
      question:
        "## What are all the ways to center content with Flexbox?\n\nExplain each method and show code examples that a reader can run to see the result at a glance.",
      answer: `## All Ways to Center with Flexbox

Flexbox makes centering straightforward. Below are the main patterns—each code block is runnable so you can see the output.

---

### 1. Classic: \`justify-content\` + \`align-items\` (both axes)

Center a single child horizontally and vertically. Most common method.

\`\`\`html
<div style="display: flex; justify-content: center; align-items: center; min-height: 200px; background: #f0f0f0; border-radius: 8px;">
  <div style="padding: 1rem; background: #333; color: white; border-radius: 6px;">Centered</div>
</div>
\`\`\`

---

### 2. Shorthand: \`place-items: center\`

\`place-items\` is shorthand for \`align-items\` + \`justify-items\` (in grid) or use with \`place-content\` for flex. For flex, \`place-content: center\` centers the whole flex line.

\`\`\`html
<div style="display: flex; min-height: 200px; background: #e8e8e8; border-radius: 8px; place-content: center; align-items: center;">
  <div style="padding: 1rem; background: #0066cc; color: white; border-radius: 6px;">place-content center</div>
</div>
\`\`\`

---

### 3. \`margin: auto\` on the flex child

In a flex container, a single child with \`margin: auto\` absorbs extra space and centers.

\`\`\`html
<div style="display: flex; min-height: 200px; background: #f5f5f5; border-radius: 8px;">
  <div style="margin: auto; padding: 1rem; background: #28a745; color: white; border-radius: 6px;">margin: auto</div>
</div>
\`\`\`

---

### 4. Column layout: \`flex-direction: column\` + \`justify-content\` & \`align-items\`

Center along the main axis (vertical) and cross axis (horizontal).

\`\`\`html
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 200px; background: #fff3e0; border-radius: 8px;">
  <div style="padding: 1rem; background: #e65100; color: white; border-radius: 6px;">Column center</div>
</div>
\`\`\`

---

### 5. \`justify-content: center\` only (horizontal, single row)

For inline/flex items in a row, \`justify-content: center\` centers them horizontally. Add \`align-items: center\` if you also want vertical centering.

\`\`\`html
<div style="display: flex; justify-content: center; min-height: 120px; background: #e3f2fd; border-radius: 8px; align-items: center;">
  <span style="padding: 0.5rem 1rem; background: #1565c0; color: white; border-radius: 4px;">Horizontally centered</span>
</div>
\`\`\`

---

### 6. Multiple items centered as a group

\`justify-content: center\` and \`align-items: center\` center the group of flex children as a whole.

\`\`\`html
<div style="display: flex; justify-content: center; align-items: center; gap: 12px; min-height: 180px; background: #fce4ec; border-radius: 8px;">
  <span style="padding: 8px 16px; background: #c2185b; color: white; border-radius: 4px;">A</span>
  <span style="padding: 8px 16px; background: #c2185b; color: white; border-radius: 4px;">B</span>
  <span style="padding: 8px 16px; background: #c2185b; color: white; border-radius: 4px;">C</span>
</div>
\`\`\`

---

### 7. Center in viewport (full page)

Common pattern for landing or login: full viewport with flex, then center the card.

\`\`\`html
<div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: -8px; background: #1a1a2e; font-family: system-ui;">
  <div style="padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); text-align: center;">
    <p style="margin: 0 0 0.5rem 0; font-weight: bold;">Centered card</p>
    <p style="margin: 0; color: #666;">Flexbox: justify-content + align-items</p>
  </div>
</div>
\`\`\`

---

## Quick reference

| Goal | Flex on parent | Typical use |
|------|----------------|-------------|
| Center one child (both axes) | \`display: flex; justify-content: center; align-items: center;\` | Dialogs, heroes |
| Center one child (both axes) | \`display: flex;\` + child \`margin: auto;\` | Alternative to above |
| Center in column | \`flex-direction: column; justify-content: center; align-items: center;\` | Vertical stacks |
| Center horizontally only | \`display: flex; justify-content: center;\` | Toolbars, single row |

Use the runnable examples above to see each method at a glance.`,
      tags: ["css", "flexbox", "layout", "centering"],
      difficulty: "easy",
      linkedSnippetIds: ["snippet-3"],
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4,
    },
    {
      id: "qa-4",
      topicId: "css-basics",
      title: "CSS Box Model",
      question: "## Explain the CSS Box Model",
      answer: `## The Box Model

Every HTML element is represented as a rectangular box with four areas:

1. **Content**: The actual content (text, images, etc.)
2. **Padding**: Space between content and border
3. **Border**: The border around padding
4. **Margin**: Space outside the border

\`\`\`css
.box {
  width: 300px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}
\`\`\`

## Box Sizing

### content-box (default)
Width/height applies to content only:
\`\`\`css
.content-box {
  box-sizing: content-box;
  width: 300px; /* Total width = 300 + padding + border */
}
\`\`\`

### border-box (recommended)
Width/height includes padding and border:
\`\`\`css
.border-box {
  box-sizing: border-box;
  width: 300px; /* Total width = 300 (includes padding + border) */
}
\`\`\`

## Best Practice

Always use \`border-box\` for predictable sizing:

\`\`\`css
* {
  box-sizing: border-box;
}
\`\`\``,
      tags: ["css", "box-model", "layout", "fundamentals"],
      difficulty: "easy",
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4,
    },
    {
      id: "qa-5",
      topicId: "html-semantics",
      title: "Semantic HTML Elements",
      question: "## What are semantic HTML elements and why are they important?",
      answer: `## Semantic HTML

Semantic elements clearly describe their meaning to both the browser and the developer.

## Common Semantic Elements

### Structure
- \`<header>\`: Introductory content or navigation
- \`<nav>\`: Navigation links
- \`<main>\`: Main content of the document
- \`<article>\`: Self-contained content
- \`<section>\`: Thematic grouping of content
- \`<aside>\`: Content tangentially related to main content
- \`<footer>\`: Footer information

### Content
- \`<figure>\` & \`<figcaption>\`: Images with captions
- \`<time>\`: Dates and times
- \`<mark>\`: Highlighted text
- \`<details>\` & \`<summary>\`: Collapsible content

## Example

\`\`\`html
<article>
  <header>
    <h1>Article Title</h1>
    <time datetime="2024-01-15">January 15, 2024</time>
  </header>
  
  <section>
    <h2>Introduction</h2>
    <p>Article content...</p>
  </section>
  
  <footer>
    <p>Author: John Doe</p>
  </footer>
</article>
\`\`\`

## Benefits

1. **Accessibility**: Screen readers can navigate better
2. **SEO**: Search engines understand content structure
3. **Maintainability**: Code is more readable and maintainable
4. **Styling**: Easier to target with CSS`,
      tags: ["html", "semantics", "accessibility", "seo"],
      difficulty: "easy",
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
    },
  ],
  snippets: [
    {
      id: "snippet-1",
      topicId: "react-hooks",
      title: "useMemo Example",
      language: "tsx",
      code: `import { useMemo } from 'react';

interface Props {
  items: string[];
  filter: string;
}

export function FilteredList({ items, filter }: Props) {
  // Expensive filtering operation - only recalculate when items or filter changes
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => 
      item.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <ul>
      {filteredItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}`,
      description: "Demonstrates useMemo for expensive filtering operations",
      tags: ["react", "hooks", "useMemo", "performance"],
      revisions: [],
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 7,
    },
    {
      id: "snippet-2",
      topicId: "javascript",
      title: "Closure Counter Example",
      language: "javascript",
      code: `function createCounter(initialValue = 0) {
  let count = initialValue;
  
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    reset() {
      count = initialValue;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

// Usage
const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.reset());     // 10`,
      description: "Classic closure example demonstrating data privacy",
      tags: ["javascript", "closures", "patterns"],
      revisions: [],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
    {
      id: "snippet-3",
      topicId: "css-basics",
      title: "Flexbox Centering",
      language: "html",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexbox Centering Preview</title>
  <style>
    * { box-sizing: border-box; }
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
    }
    .centered-content {
      padding: 1.5rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      text-align: center;
      font-family: system-ui, sans-serif;
    }
    .centered-content h3 { margin: 0 0 0.5rem 0; color: #333; }
    .centered-content p { margin: 0; color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="centered-content">
      <h3>Flexbox centering</h3>
      <p>justify-content: center + align-items: center</p>
    </div>
  </div>
</body>
</html>`,
      description: "Live HTML preview: perfect centering with Flexbox (run to see output at a glance)",
      tags: ["css", "flexbox", "layout", "centering"],
      revisions: [],
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4,
    },
  ],
}
