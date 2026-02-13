# Components

## 12. Action system

### 12.1 Primary action

**Location:**

1. Top right in topbar, or in the header of the central panel.

**Rules:**

1. One primary action per screen.
2. It must have a clear label, no vague verbs.

### 12.2 Secondary actions

**Location:**

1. In context overflow menu.
2. In row actions inside table.

**Rules:**

1. If a secondary action is frequent, it becomes visible.
2. If destructive, it lives in a menu and requires confirmation.

### 12.3 Quick commands

1. Command palette is the entry point to global actions.
2. Keyboard shortcuts for frequent actions.

## 13. Command palette

### 13.1 Shortcut

- **Mac:** `Cmd` + `K`
- **Windows:** `Ctrl` + `K`

### 13.2 Behavior

1. Input with immediate search.
2. Results grouped by context: actions, navigation, objects, recent.
3. Support text-style commands.
    - *Example:* "create campaign", "open segment"

### 13.3 Design rules

1. Elevated overlay background, radius 14px.
2. Dense list, item height 36px.
3. Shortcut hint on the right.
4. Enter executes, escape closes.
5. Arrows navigate.

## 14. Required base components

### Primary implementation

1. **Core:** Tailwind CSS
2. **Primitives:** Radix UI
3. **Components:** shadcn and Kibo UI
4. **Data table:** TanStack Table
5. **Prompt UI:** Prompt-Kit
6. **Blocks/Components:** Blocks.so, shadcnblocks and Hexta UI
7. **Motion:** Framer Motion
8. **Charts:** Recharts and EvilCharts
9. **Icons:** HugeIcons (bun add @hugeicons/react @hugeicons/core-free-icons)

### Required components

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
13. Modal dialog
14. Drawer
15. Toast
16. Banner
17. Skeleton
18. Table
19. Pagination
20. Empty state block
21. Command palette
22. Avatar

**Rules:**

1. Any new component derives from primitives and tokens.
2. No parallel libraries are introduced for convenience.

## 15. Composition rules

### 15.1 Modal vs drawer

**Use modal if:**

1. Critical confirmation is required.
2. The user does not need background context.
3. The task is short.

**Use drawer if:**

1. The user must keep table or view context.
2. It is editing multiple fields.
3. It is lateral inspection on mobile.

### 15.2 Popover vs tooltip

**Tooltip:**

- Short explanation only, not interactive.

**Popover:**

- Contains controls, filters, or interactive content.

### 15.3 Tabs vs sidebar

**Tabs:**

- Changes within the same entity.

**Sidebar:**

- Changes of module or global context.

### 15.4 Toast vs banner vs inline error

**Toast:**

- Short and reversible confirmation.

**Banner:**

- System failure, integration down, or blocked action.

**Inline error:**

- Input errors or local validation.

## 20. Empty and loading states

### 20.1 Empty states

**Rules:**

1. No large illustrations.
2. One-line message.
3. Optional explanation in a second line.
4. One primary CTA.
5. One secondary link.

### 20.2 Skeletons

**Rules:**

1. Skeleton always represents the real structure.
2. Duration `motion_medium`.
3. No aggressive shimmer.

## 21. Feedback system

### 21.1 Toasts

**Use:**

1. Confirmation of successful actions.
2. Undo when possible.

**Rules:**

1. Duration: 4s.
2. Maximum 2 visible.
3. Never cover primary actions.

### 21.2 Inline errors

1. Message below the control.
2. Clear text, no codes.
3. Visual signal with border and icon.

### 21.3 Banners

1. Only for system or integration failures.
2. Always with action: retry, open status, contact support.

---

