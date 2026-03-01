// Flexbox Centering demo content for "Add manually" (Option A)
import * as storage from "@/lib/storage"
import type { QAItem, Snippet, Topic } from "@/lib/types"

const FLEXBOX_QA_TITLE = "Flexbox Centering"
const FLEXBOX_SNIPPET_TITLE = "Flexbox Centering"
const CSS_BASICS_ID = "css-basics"
const SNIPPET_ID = "snippet-flexbox-centering"
const QA_ID = "qa-flexbox-centering"

const flexboxSnippet: Snippet = {
  id: SNIPPET_ID,
  topicId: CSS_BASICS_ID,
  title: FLEXBOX_SNIPPET_TITLE,
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
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const flexboxQA: QAItem = {
  id: QA_ID,
  topicId: CSS_BASICS_ID,
  title: FLEXBOX_QA_TITLE,
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

### 2. Shorthand: \`place-content: center\`

For flex, \`place-content: center\` centers the flex line; pair with \`align-items: center\` for both axes.

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

\`\`\`html
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 200px; background: #fff3e0; border-radius: 8px;">
  <div style="padding: 1rem; background: #e65100; color: white; border-radius: 6px;">Column center</div>
</div>
\`\`\`

---

### 5. Horizontal only: \`justify-content: center\`

\`\`\`html
<div style="display: flex; justify-content: center; min-height: 120px; background: #e3f2fd; border-radius: 8px; align-items: center;">
  <span style="padding: 0.5rem 1rem; background: #1565c0; color: white; border-radius: 4px;">Horizontally centered</span>
</div>
\`\`\`

---

### 6. Multiple items centered as a group

\`\`\`html
<div style="display: flex; justify-content: center; align-items: center; gap: 12px; min-height: 180px; background: #fce4ec; border-radius: 8px;">
  <span style="padding: 8px 16px; background: #c2185b; color: white; border-radius: 4px;">A</span>
  <span style="padding: 8px 16px; background: #c2185b; color: white; border-radius: 4px;">B</span>
  <span style="padding: 8px 16px; background: #c2185b; color: white; border-radius: 4px;">C</span>
</div>
\`\`\`

---

### 7. Center in viewport (full page)

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
  linkedSnippetIds: [SNIPPET_ID],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

/** Resolve topic ID for "CSS Basics" (create topic if missing). */
async function ensureCssBasicsTopic(): Promise<string> {
  const topics = await storage.getAllTopics()
  const existing = topics.find((t) => t.id === CSS_BASICS_ID || t.name.toLowerCase() === "css basics")
  if (existing) return existing.id
  const topic: Topic = {
    id: CSS_BASICS_ID,
    name: "CSS Basics",
    description: "CSS fundamentals and layout techniques",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await storage.saveTopic(topic)
  return topic.id
}

/** Add Flexbox Centering Q&A and snippet if they don't already exist (Option A: add manually). */
export async function addFlexboxDemoContent(): Promise<{ addedQA: boolean; addedSnippet: boolean }> {
  const topicId = await ensureCssBasicsTopic()
  const [qaItems, topicSnippets] = await Promise.all([
    storage.getQAItemsByTopic(topicId),
    storage.getSnippetsByTopic(topicId),
  ])
  const hasQA = qaItems.some((q) => q.title === FLEXBOX_QA_TITLE)
  const hasSnippet = topicSnippets.some((s) => s.title === FLEXBOX_SNIPPET_TITLE)

  const snippetToSave = { ...flexboxSnippet, topicId }
  let addedQA = false
  let addedSnippet = false

  if (!hasSnippet) {
    await storage.saveSnippet(snippetToSave)
    addedSnippet = true
  }

  if (!hasQA) {
    const linkedId = addedSnippet ? SNIPPET_ID : topicSnippets.find((s) => s.title === FLEXBOX_SNIPPET_TITLE)?.id
    const qaToSave: QAItem = {
      ...flexboxQA,
      topicId,
      linkedSnippetIds: linkedId ? [linkedId] : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await storage.saveQAItem(qaToSave)
    addedQA = true
  }

  return { addedQA, addedSnippet }
}
