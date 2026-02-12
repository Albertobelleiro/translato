# AI Wave App - Agent Instructions (`AGENTS.md`)

This file provides authoritative instructions for AI agents (Cursor, Windsurf, Copilot, etc.) working on this repository.
**Follow these guidelines strictly to maintain consistency, performance, and the intended design system.**

---

## Rule 0: Read the documentation before UI changes

Before any UI change, read the required documentation in `design-system/`. Use this quick guide to go directly to the correct document:

- `design-system/01-principles.md`: principles and objectives.
- `design-system/02-foundations.md`: typography, color, spacing, tokens and visual bases.
- `design-system/03-layout.md`: grid, breakpoints, app shell, fixed measures and padding.
- `design-system/04-components.md`: component rules and composition.
- `design-system/05-patterns.md`: complex patterns (prompt to output, tables, inspector, activity log).
- `design-system/06-governance.md`: change process, RFC, freeze window and reviews.
- `design-system/07-components.md`: component inventory and source/installation.

---

## 1. Technology Stack & Core Mandates

**Primary Rule:** Default to using **Bun** instead of Node.js, npm, pnpm, or Vite.

| Category | Technology | Package/Install |
| :--- | :--- | :--- |
| **Runtime** | **Bun** | Use `bun` for scripts, install, and test. |
| **Frontend** | **React 19** | Functional Components with Hooks ONLY. |
| **Language** | **TypeScript** | Strict mode. No `any`. No JS files. |
| **Build/Serve** | **Bun** | Use `bun --hot` or `Bun.serve()`. |
| **Styling** | **Tailwind CSS v4** | Core styling system. |
| **UI Primitives** | **Radix UI** | Headless accessible components. |
| **Components** | **Kibo UI + shadcn/ui** | Reusable components (Radix + Tailwind). |
| **Blocks** | **Blocks.so, shadcnblocks, Hexta UI** | Pre-built UI blocks. |
| **Data/Tables** | **TanStack Table** | `@tanstack/react-table` |
| **AI UI** | **Prompt Kit** | AI-specific UI components. |
| **Charts** | **Recharts + EvilCharts** | Data visualization. |
| **Assets** | **Nucleo Glass SVG Icons + Outpace Avatars** | External assets (see `design-system/07-components.md`) |
| **Motion** | **Framer Motion** | Animation library. |
| **Icons** | **HugeIcons** | `@hugeicons/react @hugeicons/core-free-icons` |

### Install Commands
```bash
# Core dependencies
bun add react react-dom tailwindcss

# UI Primitives & Components
bun add @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tooltip
bun add @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs

# Data & Tables
bun add @tanstack/react-table

# Charts
bun add recharts

# Motion
bun add framer-motion

# Icons
bun add @hugeicons/react @hugeicons/core-free-icons

# Assets (external)
# Use the sources listed in design-system/07-components.md

# Utilities
bun add clsx tailwind-merge class-variance-authority
```

### Key Constraints
- **NO Class Components**: Functional components only.
- **NO Default Exports**: Use named exports (`export function Component()`).
- **NO Node.js/NPM**: Strictly use `bun install`, `bun test`, `bun run`.
- **NO Dotenv**: Bun loads `.env` automatically.

---

## 2. Bun Native Implementation Rules

### Command Replacements
| Instead of | Use |
| :--- | :--- |
| `npm/yarn/pnpm install` | `bun install` |
| `npm run <script>` | `bun run <script>` |
| `npx <package>` | `bunx <package>` |
| `jest/vitest` | `bun test` |
| `node <file>` | `bun <file>` |

**Exception:** For shadcn/prompt-kit, follow the exact commands in `design-system/07-components.md` (uses `npx shadcn add ...`).

### Native APIs (Prefer these over libraries)
- **Server:** `Bun.serve()` (NOT Express/Fastify)
- **SQLite:** `bun:sqlite` (NOT better-sqlite3)
- **Postgres:** `Bun.sql` (NOT pg/postgres.js)
- **Redis:** `Bun.redis` (NOT ioredis)
- **WebSocket:** Native `WebSocket` (NOT ws package)
- **File IO:** `Bun.file(path)` (NOT fs.readFile)
- **Shell:** `Bun.$\`ls\`` (NOT execa)

### Frontend Serving Pattern (No Vite)
```ts
// index.ts
import index from "./index.html";

Bun.serve({
  routes: {
    "/": index,
    "/api/data": { GET: () => Response.json({ status: "ok" }) }
  },
  development: { hmr: true }
});
```

---

## 3. Design System

**Core Principle:** The interface exists to convert intention into execution with minimal friction.

### 3.1 Guiding Rules
1. **Compact Density**: No landing-page style spacing. High information density.
2. **Text & Data First**: Content > Decoration. Typography clear, values aligned, tables legible.
3. **Color is Secondary**: Used for state, focus, selection, emphasis. NOT decoration.
4. **Decoration Near Zero**: Clean backgrounds, no patterns. Graphics only if they aid understanding.

---

## 4. Color System

### 4.1 Philosophy
**Neutrals first. Accent for actions. States last.**

### 4.2 Base palettes (theme)

**Dark base**
```
base_bg      #1A1D21
base_sidebar #15181C
base_stroke  #2F3033
base_icons   #A1A4A7
base_text    #EEEFF1
base_hover   #242529
accent       #4D76FF
```

**Light base**
```
base_bg      #FFFFFF
base_sidebar #FBFBFB
base_stroke  #FBFBFB
base_icons   #505154
base_text    #242529
base_hover   #EEEFF1
accent       #0036E6
```

### 4.3 Accent scales (base = 500)

**Dark accent primitives**
```
accent_50  #ECF2FF
accent_100 #BDD2FF
accent_200 #99B7FF
accent_300 #769BFF
accent_400 #4D76FF
accent_500 #4D76FF
accent_600 #3756BE
accent_700 #253B87
accent_800 #142355
accent_900 #070F2E
accent_950 #010412
```

**Light accent primitives**
```
accent_50  #E4EDFF
accent_100 #A3C1FD
accent_200 #719CF9
accent_300 #3F75F2
accent_400 #0036E6
accent_500 #0036E6
accent_600 #0025AB
accent_700 #00187A
accent_800 #000B4C
accent_900 #000328
accent_950 #00010F
```

### 4.4 State colors
```
success_700 #15803D
warning_700 #B45309
error_700   #B91C1C
info_700    #0369A1
```

**Rules:**
1. The state stroke is barely visible (minimum contrast).
2. State text uses the state color for harmony with the base text.

### 4.5 Semantic tokens (theme)

- `color_bg_canvas`
- `color_bg_surface`
- `color_bg_panel`
- `color_bg_elevated`
- `color_bg_sidebar`
- `color_bg_hover`
- `color_bg_selected`
- `color_text_primary`
- `color_text_secondary`
- `color_text_muted`
- `color_text_inverse`
- `color_border_subtle`
- `color_border_strong`
- `color_accent_primary`
- `color_accent_focus`
- `color_accent_hover`
- `color_accent_pressed`
- `color_accent_subtle_bg`
- `color_state_default`
- `color_state_hover`
- `color_state_pressed`
- `color_state_selected`
- `color_state_disabled_bg`
- `color_state_disabled_text`
- `color_state_focus`
- `color_state_success`
- `color_state_success_bg`
- `color_state_success_border`
- `color_state_success_text`
- `color_state_warning`
- `color_state_warning_bg`
- `color_state_warning_border`
- `color_state_warning_text`
- `color_state_error`
- `color_state_error_bg`
- `color_state_error_border`
- `color_state_error_text`
- `color_state_info`
- `color_state_info_bg`
- `color_state_info_border`
- `color_state_info_text`

### 4.6 Contrast Requirements
- **Text normal**: Minimum AA 4.5:1
- **Text large**: Minimum 3:1
- **UI components/icons**: Minimum 3:1 against background
- **Focus indicator**: Always clearly distinguishable

---

## 5. Typography

### 5.1 Font Family
**Inter** - Single typeface. No changes.

### 5.2 Base Typography
| Property | Value |
| :--- | :--- |
| **Font Family** | Inter |
| **Font Weight** | 500 (Normal) |
| **Font Size** | 14px |
| **Line Height** | 20px |
| **Letter Spacing** | 0 |

### 5.3 Single exception
| Uso | Size | Line Height | Weight |
| :--- | :--- | :--- | :--- |
| Sidebar header | 16px | 20px | 600 |

### 5.4 Typography Rules
1. **Default global:** 14px / 20px / 500. Esto aplica a casi todo.
2. **Single exception:** sidebar header (logo + name) at 16px / 20px / 600.
3. **Do not use alternate styles** without system approval.
4. **Tabular numbers:** Enable `font-variant-numeric: tabular-nums` for metrics/tables.
5. **Monospace:** Only for IDs, logs, and technical snippets.

---

## 6. Icons (HugeIcons)

### 6.1 Package Installation
```bash
bun add @hugeicons/react @hugeicons/core-free-icons
```

### 6.2 Usage
```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";

// Usage
<HugeiconsIcon icon={Home01Icon} size={20} />
<HugeiconsIcon icon={Settings01Icon} size={20} className="text-[var(--base_icons)]" />
```

### 6.3 Icon Rules
- **Default size:** 20px for UI, 16px for inline, 24px for headers
- **Color:** Use `--base_icons` token
- **Style:** Stroke style (not filled)
- **ONLY use HugeIcons.** No other icon libraries.

---

## 7. Spacing System (Closed)

### 7.1 Spacing Scale
```
0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64 (px)
```

| Token | Value |
| :--- | :--- |
| `--spacing-0` | 0px |
| `--spacing-0_5` | 2px |
| `--spacing-1` | 4px |
| `--spacing-1_5` | 6px |
| `--spacing-2` | 8px |
| `--spacing-3` | 12px |
| `--spacing-4` | 16px |
| `--spacing-5` | 20px |
| `--spacing-6` | 24px |
| `--spacing-8` | 32px |
| `--spacing-10` | 40px |
| `--spacing-12` | 48px |
| `--spacing-16` | 64px |

### 7.2 Spacing Rules
1. **NO values outside the scale.**
2. **Component base padding:** 8px or 12px depending on density.
3. **Vertical section separation:** 24px or 32px.

---

## 8. Border Radius (Closed System)

### 8.1 Radius Scale
```
0, 6, 10, 14 (px)
```

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--radius-none` | 0px | Tables, table cells |
| `--radius-sm` | 6px | Small elements, badges |
| `--radius-md` | 10px | Inputs, buttons, pills, menus, tooltips |
| `--radius-lg` | 14px | Cards, panels, modals, command palette |

### 8.2 Radius Rules
- **Inputs/Buttons/Pills:** `rounded-[10px]`
- **Cards/Panels/Modals:** `rounded-[14px]`
- **Menus/Tooltips:** `rounded-[10px]`
- **Tables/Cells:** `rounded-none` (except container)

---

## 9. Borders & Elevation

### 9.1 Border Width
- **Default:** 1px
- **Strong (focus/critical selection):** 2px

### 9.2 Border Philosophy
**Border is the primary separation mechanism. Shadow only for overlays.**

### 9.3 Elevation Levels (Max 3)
| Level | Name | Usage | Shadow Token |
| :--- | :--- | :--- | :--- |
| 0 | Flat | Normal surfaces | `--shadow-none` |
| 1 | Overlay Soft | Popovers, tooltips | `--shadow-overlay-soft` |
| 2 | Overlay Strong | Dropdowns, drawers | `--shadow-overlay-strong` |
| 3 | Modal Critical | Modals, dialogs | `--shadow-modal` |

**Rule:** On normal surfaces, prefer border over shadow.

---

## 10. Layout & App Shell

### 10.1 Breakpoints
| Name | Width |
| :--- | :--- |
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

**Max content width:** 1040px (read/config only). Data views always full width, no container.

### 10.2 Fixed App Shell Measurements
| Element | Dimension |
| :--- | :--- |
| **Topbar Height** | 56px (`--topbar-height`) |
| **View Header (base)** | 56px (`--view-header-height-base`) |
| **View Header (secondary)** | 40px (`--view-header-height-secondary`) |
| **Sidebar Expanded** | 348px (`--sidebar-width-expanded`) |
| **Sidebar Collapsed** | 64px (`--sidebar-width-collapsed`) |
| **Sidebar Header** | 56px (`--sidebar-header-height`) |
| **Sidebar Footer (min)** | 56px (`--sidebar-footer-min-height`) |
| **Inspector Width** | 520px (`--inspector-width`) |
| **Inspector Range** | 480px-600px (`--inspector-width-min/max`) |
| **Page Padding (Desktop)** | 24px |
| **Page Padding (Tablet)** | 16px |
| **Page Padding (Mobile)** | 12px |
| **Vertical Padding** | 16px |

**View header secondary row:** filters, sorting, chips and secondary controls (40px).
**Data grids:** Body can go to 0px horizontal padding. Header keeps padding.

### 10.3 App Shell Rules
1. **DO NOT redesign app shell per feature.**
2. **All features fit in main panel + inspector.**
3. **Inspector becomes drawer only when viewport < 1280px.**

---

## 11. App Shell Content Rules

### 11.1 Sidebar (Global Context)
**Allowed content:**
- Workspace/account selector
- Primary module navigation
- Favorites
- Quick access to search/command palette
- System status and notifications

**Rules:**
- Sidebar is for changing GLOBAL context.
- NEVER put view filters or local controls in sidebar. Filters live in view header.
- Background: `--color_bg_sidebar`

### 11.2 Topbar (Local Context)
**Allowed content:**
- Breadcrumb / local navigation context
- View switcher for current entity
- Contextual search
- Primary actions for current context
- Sync/execution status indicators

**Rules:**
- NEVER fill topbar with marketing, banners, or cards.
- Max 3 primary actions with visible label.
- Secondary actions go to menu.
- In high-ops views, a primary action can be icon-only.

### 11.3 Main Area Patterns
- Editable Table
- Kanban
- Analytics
- Prompt to Output
- Campaign/Asset Editor

**Rules:**
- Main area is flat by default (no layout-level cards).
- Cards only inside inspector, modals, or specific dashboard blocks.

### 11.4 Inspector (Right Panel)
**Purpose:**
- Selected item detail
- History
- Actions
- Notes/comments
- Contextual activity log

**Rule:** If user needs to open a new page to see detail, the pattern is failing.
**Rule:** Inspector is always contextual to the active selection, never independent.

---

## 12. Navigation

### 12.1 Sidebar Modules (Recommended)
1. Overview
2. Workflows
3. Campaigns
4. Content and Assets
5. Segments
6. Analytics
7. Activity Log
8. Integrations
9. Settings

### 12.2 Tabs
- Use for sub-views within same object (e.g., Overview, Runs, Assets, Notes)
- **Maximum 5 visible tabs.** More = convert to tab menu.
- **Fixed row height:** 40px. Tabs must not push layout.

### 12.3 Breadcrumb
- Only when user is 2+ levels deep.
- Breadcrumb does NOT replace view selector.
- Can live inside the view header without adding a new row.

---

## 13. Motion

### 13.1 Principle
**Motion confirms actions and state changes. It does NOT decorate.**

### 13.2 Duration Tokens
| Token | Duration | Usage |
| :--- | :--- | :--- |
| `--duration-fast` | 120ms | Hover, popover/tooltip open |
| `--duration-medium` | 180ms | Drawer, modal |
| `--duration-slow` | 240ms | Full view change (only if prevents visual jump) |

### 13.3 Easing
| Token | Value | Usage |
| :--- | :--- | :--- |
| `easing_standard` | `cubic-bezier(0.2, 0, 0, 1)` | Enter/standard |
| `easing_exit` | `cubic-bezier(0.4, 0, 1, 1)` | Exit |

### 13.4 Reduced Motion
Respect `prefers-reduced-motion`. When active: eliminate movement, reduce to 120ms fade.

---

## 14. Interaction States

### 14.1 State Tokens
- `state_default`
- `state_hover`
- `state_pressed`
- `state_selected`
- `state_disabled`
- `state_focus`

### 14.2 Rules
1. **Hover:** Use `--color_bg_hover`. Only on interactive elements.
2. **Pressed:** Reduce contrast + 1px Y-axis shift if applicable.
3. **Selected:** Use `--color_bg_hover` + accent left border.
4. **Disabled:** Reduce opacity to 50%, disable cursor + keyboard.
5. **Focus ring:** NEVER remove. Adjust layout if visual conflict.

### 14.3 Focus Ring Spec
- **Width:** 2px
- **Offset:** 2px
- **Color:** `--color_accent_focus`
- **If background similar to ring:** Use double ring (2px accent + 1px `--color_border_subtle` inside).

### 14.4 List/Table Hover & Selection
- **Row hover:** `--color_bg_hover`
- **Row selection:** 2px left border `--color_accent_primary` + `--color_bg_hover`
- **Multi-selection:** Visible checkbox, bulk actions in toolbar.

---

## 15. Command Palette

### 15.1 Shortcut
- **Mac:** Cmd+K
- **Windows:** Ctrl+K

### 15.2 Behavior
1. Input with immediate search
2. Results grouped by context: actions, navigation, objects, recent
3. Support text-style commands (e.g., "create campaign", "open segment")

### 15.3 Design Rules
- Elevated overlay background, radius 14px
- Dense list, item height 36px
- Shortcut hint on right
- Enter executes, Escape closes
- Arrow keys navigate

---

## 16. Component Composition Rules

### 16.1 Modal vs Drawer
| Use Modal when: | Use Drawer when: |
| :--- | :--- |
| Critical confirmation needed | User needs table/view context |
| No background context needed | Multi-field editing |
| Short task | Mobile lateral inspection |

### 16.2 Popover vs Tooltip
| Tooltip | Popover |
| :--- | :--- |
| Short explanation only | Contains controls, filters, interactive content |
| Non-interactive | Interactive |

### 16.3 Toast vs Banner vs Inline Error
| Toast | Banner | Inline Error |
| :--- | :--- | :--- |
| Short confirmation | System/integration failure | Input validation |
| Reversible action | Blocked action | Local field error |
| 4s duration, max 2 visible | With action (retry, status, support) | Below control with icon |

---

## 17. Coding Standards

### 17.1 File Structure
```
src/
  components/
    ui/          # Generic reusable (shadcn-like)
    layout/      # Structural (Sidebar, Shell, Topbar)
  pages/         # Page components
  hooks/         # camelCase.ts
  lib/           # camelCase.ts (utils)
```

### 17.2 Naming Conventions
- **Files/Components:** `PascalCase.tsx`
- **Functions/Variables/Hooks:** `camelCase`
- **Interfaces:** `PascalCase` (No `I` prefix)

### 17.3 TypeScript Rules
- **Strict Mode:** No `any`. Define interfaces for all props.
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}
```

### 17.4 Styling Rules
- **Always use `cn()`** (clsx + tailwind-merge) for reusable components.
- **Mobile First:** Write mobile styles first, then `md:`, `lg:`.
```tsx
import { cn } from "@/lib/utils";
<div className={cn("bg-[var(--color_bg_canvas)] p-[var(--spacing-4)]", className)} />
```

### 17.5 Best Practices
- **Early returns:** Reduce nesting depth.
- **Composability:** Break down large components.
- **Accessibility:** Semantic HTML (`nav`, `main`, `button`) + ARIA where needed.

---

## 18. Workflow

### 18.1 Development Cycle
1. **Install:** `bun install`
2. **Dev:** `bun --hot ./index.ts` (or `bun run dev`)
3. **Lint:** `bun run lint`
4. **Test:** `bun test`

### 18.2 Verification
- **Console:** NO React warnings (keys, nesting, etc.)
- **Server:** Starts without errors
- **Tests:** Run related tests before committing

### 18.3 Git
- **Messages:** Imperative mood ("Add feature", "Fix bug")
- **Commits:** Atomic and verified

---

## 19. Templates

### 19.1 Component Template
```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

// Cards use radius-lg (14px) per design system
// Prefer border to shadow for normal surfaces
export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-[var(--color_bg_canvas)] p-[var(--spacing-4)]",
        variant === "bordered" && "border border-[var(--color_border_subtle)]",
        className
      )}
      {...props}
    />
  );
}
```

### 19.2 Button Template
```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

// Buttons use radius-md (10px) per design system
export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] px-[var(--spacing-4)] py-[var(--spacing-2)]",
        "text-[14px] leading-[20px] font-medium transition-colors duration-[120ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color_accent_focus)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && [
          "bg-[var(--color_accent_primary)] text-white",
          "hover:bg-[var(--color_accent_hover)]",
          "active:bg-[var(--color_accent_pressed)]",
          "active:translate-y-[1px]"
        ],
        variant === "secondary" && [
          "bg-[var(--color_bg_canvas)] text-[var(--color_text_primary)]",
          "border border-[var(--color_border_subtle)]",
          "hover:bg-[var(--color_bg_hover)]"
        ],
        variant === "ghost" && [
          "text-[var(--color_text_primary)]",
          "hover:bg-[var(--color_bg_hover)]"
        ],
        className
      )}
      {...props}
    />
  );
}
```

### 19.3 Icon Usage Template
```tsx
import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: typeof Home01Icon;
  size?: number;
}

export function IconButton({ icon, size = 20, className, ...props }: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] p-[var(--spacing-2)]",
        "text-[var(--base_icons)] transition-colors duration-[120ms]",
        "hover:bg-[var(--color_bg_hover)] hover:text-[var(--color_text_primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color_accent_focus)]",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={icon} size={size} />
    </button>
  );
}
```

### 19.4 Test Template (`bun test`)
```ts
import { describe, test, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  test("renders correctly", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeTruthy();
  });
});
```

---

## 20. Accessibility Requirements

### 20.1 Contrast
- Meet minimum AA for text and UI.
- Test tokens and variants in both light and dark themes.

### 20.2 Focus
- Always visible
- Complete keyboard navigation
- Logical tab order

### 20.3 Keyboard First
- Command palette available on any screen
- Shortcuts visible in tooltips where applicable
- In tables: arrows navigate, Enter edits, Escape closes

### 20.4 User Preferences
- Respect `prefers-reduced-motion`
- Respect browser text size
- High contrast when possible

---

## 21. Required Components

All components derive from primitives and tokens. No parallel libraries.

1. Button
2. IconButton
3. Input
4. Select
5. Textarea
6. Checkbox
7. Switch
8. Radio
9. Tabs
10. Badge
11. Tooltip
12. Popover
13. Modal/Dialog
14. Drawer
15. Toast
16. Banner
17. Skeleton
18. Table
19. Pagination
20. Empty State
21. Command Palette
22. Avatar

> Full inventory and install commands live in `design-system/07-components.md`.

---

## 22. Prompt to Output Pattern

**Structure**
1. Split is resizable and persistent per workspace/user.
2. Right panel can show main output plus internal section index for long results.
3. Inspector is execution context with tabs: Details, Logs, Inputs.

**States**
1. Draft shows ETA preview before run.
2. Processing uses visible stepper with status: pending, running, done, failed.
3. Logs are collapsible with autoscroll and pause.
4. Ready renders by type; unknown types render as structured text (not raw JSON).
5. Error always includes: what failed, why it fails, one-click action, and technical details link.
6. Retry supports full run or per-step.
7. Saved creates snapshot with run id and input references.

**Ready actions**
1. Max 2 visible actions with label; rest in menu.
2. Regenerate partial lets user select section/step/block and shows simple diff.
3. Versioning includes timestamp, author, optional notes, and restore.
4. Run in progress persists when navigating away (persistent indicator + deep link).
5. Undo available after partial regeneration.

---

## 23. Editable Table Pattern

**Header / Footer**
1. Header can be two rows: title/actions, then filters + chips.
2. Footer can be sticky to keep pagination and counts visible.

**Columns**
1. First column is sticky and includes checkbox + type icon.
2. Columns can pin left/right with subtle shadow between pinned and scrollable.
3. Minimum widths (reference): text short 160px, text long 240px, number 120px, tag list 200px, date 160px, user 200px.
4. Truncation uses short-delay tooltip and double-click expand cell.

**Sort / Filters / Views**
1. Click toggles asc/desc. Alt-click adds secondary sort.
2. Filters live in popover; chips are removable with visible Clear all.
3. Save view stores columns, order, filters, density, pinned columns.

**Inline edit**
1. Tab/Shift+Tab moves across editable cells.
2. Arrows move grid when not editing.
3. Tags use inline picker, users use search select, dates use compact calendar.
4. Validation is non-blocking: show cell error state + short message.

**Bulk / Empty / Loading**
1. Select all page + offer select all matching when filters active.
2. Bulk toolbar sticky with count and one primary action; rest in menu.
3. Empty state CTA creates or imports; secondary link opens in-app guide.
4. Skeleton matches real column widths and pinned columns.

---

## 24. Inspector Pattern

1. Internal header fixed at 40px with tabs/actions.
2. Notes/comments and Activity are tabs (not mixed scroll).
3. Fields grouped in collapsible sections to reduce scroll.
4. Selection can be pinned to detail mode without losing grid context.
5. Pinned item generates shareable URL and preserves view state on back.

---

## 25. Activity Log Pattern

1. High-level events by default; debug details behind "view details".
2. Events for the same run share run id and are groupable.
3. Dense chronological list with day separators.
4. Filters become persistent chips (same as tables).
5. Each event shows status (success/warning/error) and CTA if action required.

---

## 26. Canonical Screen + Consistency Tests

1. Canonical screen must work without permanent overlays.
2. Overlays close with Escape and only block work for destructive confirmations.
3. Toasts, modals, drawers, banners, skeletons and empty states use the same tokens and spacing.

**Success criteria**
1. Time to first value (Create + Execute): first result visible within target time.
2. Undo rate (Edit): user can undo from inspector or cell without losing context.
3. State persistence (Filter/Search): view, filters and selection persist on back.

---

## 27. Governance

1. Freeze window: 4-8 weeks.
2. No changes to base tokens, app shell measures or typography during freeze.
3. Any change requires RFC: reason, impact, alternatives, screenshots, migration plan, decision date.
4. Bi-weekly review: audit inconsistencies, fix in system, deprecate variants.
