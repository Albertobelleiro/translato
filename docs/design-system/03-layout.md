# Layout

## 9. Base layout

### 9.1 Grid and breakpoints

**Breakpoints:**

- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

**Content:**

1. **Maximum legible content:** 1040px
2. This maximum only applies to reading or configuration views.
3. Data views do not use this limit under any circumstance.
4. Tables, kanban, reports, workflows and editors must occupy the full available width of the central panel.
5. The system must not center these views or place them inside a max-width container.

### 9.2 App shell fixed measures

**Topbar:**

- **Height:** 56px
- **Internal view header:** 56px base + optional 40px for filters, sorting, chips or secondary controls.

**Sidebar:**

- **Expanded width:** 348px
- **Collapsed width:** 64px
- **Fixed top block:** 56px for quick actions and search.
- **Sticky bottom zone:** minimum 56px for system status, billing or persistent actions.

**Right inspector:**

- **Default width:** 520px
- **Allowed range:** 480px to 600px, depending on module.
- **Priority:** legibility over compaction.
- Becomes a drawer only when viewport is below 1280px.
- **Fixed internal header:** 40px for tabs, section selector or contextual actions.

**Page padding:**

- **Horizontal:** 24px desktop, 16px tablet, 12px mobile
- **Vertical:** 16px
- In table and data grid views, content can reach 0px horizontal padding.
- Padding stays in the view header, not in the table body.

**Rules:**

1. The app shell is not redesigned per feature.
2. Every feature fits in main panel and inspector.

## 10. Fixed app shell

### 10.1 Sidebar

**Allowed content:**

1. Workspace and account selector
2. Main module navigation
3. Favorites
4. Quick access to search and command palette
5. System status and notifications

**Rules:**

1. Sidebar is the place to change global context.
2. Never put view filters or local controls in the sidebar. That belongs in the view header.

### 10.2 Topbar

**Allowed content:**

1. Breadcrumb or local navigation context
2. View switcher for the current entity
3. Contextual search
4. Primary actions for the context
5. Sync and execution status indicators

**Rules:**

1. Topbar is never filled with marketing, banners or cards.
2. Maximum 3 primary actions with visible label.
3. Secondary or less frequent actions go to menu.
4. In highly operational views, a primary action can be icon-only.

### 10.3 Central area

**Contains one of these patterns:**

1. Editable table
2. Kanban
3. Analytics
4. Prompt to Output
5. Campaign or asset editor

**Rules:**

1. The central area is a flat surface by default.
2. No container cards are used at general layout level.
3. Cards only appear inside inspector, modals or specific dashboard blocks.

### 10.4 Optional right inspector

**Purpose:**

1. Selected item detail
2. History
3. Actions
4. Notes and comments
5. Contextual activity log

> **Rule:** If the user needs to open a new page to see detail, the pattern is failing.
> **Rule:** The inspector is always contextual to the active selection, never an independent space.

## 11. Navigation system

### 11.1 What goes in sidebar

**Recommended main modules for AI Wave:**

1. Overview
2. Workflows
3. Campaigns
4. Content and Assets
5. Segments
6. Analytics
7. Activity log
8. Integrations
9. Settings

### 11.2 What goes on top

1. Current context
2. View selector
3. View filters and search
4. Primary actions

**Rules:**

1. Filters, search and sorting live in a dedicated row below the title when the view requires it.
2. Recommended height of that row: 40px.

### 11.3 Tabs

**Allowed uses:**

1. Change sub-views within the same object.
    - *Example:* Overview, Runs, Assets, Notes

**Rules:**

1. Maximum 5 visible tabs.
2. If more, convert to a tabs menu.
3. Fixed tabs row height: 40px.
4. Tabs must not push the layout vertically in an arbitrary way.

### 11.4 Breadcrumb

Only when the user is 2 levels deep or more.

> **Rule:** Breadcrumb does not replace the view selector.
> **Rule:** It can be integrated inside the view header without creating an additional row.
> **Rule:** It must not increase total header height beyond the base block.

---

