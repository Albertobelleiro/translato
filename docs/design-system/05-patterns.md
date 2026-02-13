# Patterns

## 16. Star pattern: Prompt to Output

### 16.1 Structure

- **Left panel:** Prompt editor
- **Right panel:** Output and results
- **Inspector:** Run context and log

**Rules:**

1. The split is dynamic and persistent per workspace or user.
2. The right panel can show a main output and an internal side index if the result is long.
3. The inspector is the contextual execution panel with minimum tabs: Details, Logs, Inputs.

### 16.2 States

1. **Draft**
    - Editable prompt. Primary button: Run.
    - Estimated time preview before running.

2. **Processing**
    - Visible stepper with per-step status: pending, running, done, failed.
    - Action: Cancel if applicable.
    - Incremental log collapsible with autoscroll and pause option.

3. **Ready**
    - Output rendered by type.
    - Text, assets, plan, checklist, links.
    - If type is not recognized, render as structured text block, not raw JSON.

4. **Error**
    - Human message, probable cause, retry action and view details.
    - Always includes: what failed, why it usually fails, what the user can do in 1 click, and link to technical details.
    - Retry can be full or per step.

5. **Saved**
    - Result is saved as campaign draft, asset draft, or workflow snapshot.
    - Save creates a snapshot with run id and input references for reproducibility.

### 16.3 Actions in Ready

1. Save
2. Share
3. Export
4. Create campaign from result
5. Add to Assets table
6. Partial regeneration

**Rules:**

1. Maximum 2 visible actions as buttons with label. The rest in menu.
2. Never block the user without a clear way out.
3. Always show what changed when regenerating.
4. Provide version control in outputs.
5. Partial regeneration allows selecting section, step or block of the output and shows a simple comparison.
6. Version control: timestamp, author and optional notes. Allows restoring a previous version.
7. Run in progress persists when navigating, with indicator and direct access to the result.
8. Undo available when applying partial regeneration.

## 17. Editable table pattern

This pattern is core to the product and must feel premium.

### 17.1 Base structure

1. Header with view name and actions, followed by filter row and active chips when applicable.
2. Table with dense rows.
3. Footer with pagination and count.
4. Footer can be sticky in long tables.

### 17.2 Columns

**Rules:**

1. Sticky first column for checkbox and type icon.
2. Key columns can be pinned.
3. Pin left and pin right with subtle shadow separating pinned from the rest.
4. Minimum width by data type:
    - Short text: 160px
    - Long text: 240px
    - Number: 120px
    - Tag list: 200px
    - Date: 160px
    - User: 200px
5. Truncation with tooltip for long text with short delay.
6. Double click enables expand cell.

### 17.3 Sorting and filters

1. Sort by column with clear indicator.
2. Click toggles asc and desc.
3. Alt click adds secondary sort.
4. Filters in popover with active chips.
5. Active chips can be cleared individually and there is always a visible Clear all.
6. Save view with name preserves columns, order, filters, density and pinned columns.

### 17.4 Inline edit

**Rules:**

1. Click or Enter activates editing in editable cell.
2. Escape cancels.
3. Enter confirms and moves to next row.
4. Tab and Shift Tab move between editable cells.
5. Arrows move through grid when not editing.
6. Tags edit with inline picker.
7. Users with search select.
8. Dates with compact calendar.
9. Inline validation with short message without blocking the grid.
10. If error, show state in cell and allow continued work.

### 17.5 Bulk actions

1. Header checkbox selects all on page.
2. Offer select all matching when filters are active.
3. Bulk toolbar appears only if selection exists.
4. Bulk toolbar is sticky with selected count.
5. One primary action visible, the rest in menu.
6. Actions: assign, move, tag, export, delete.

### 17.6 Empty and loading

1. **Empty:** Short text, a primary CTA to create or import. Secondary link opens an in-app guide.
2. **Loading:** Skeleton rows and header, no large spinner.
3. Skeleton matches real column widths and pinned columns.

## 18. Side inspector pattern

### 18.1 Content

1. Fixed internal header with tabs and actions.
2. Item summary
3. Editable fields
4. Notes and comments as tab
5. Activity and events as tab
6. Fields grouped in collapsible sections
7. Contextual actions

### 18.2 Rules

1. Inspector opens on row selection.
2. URL does not change on simple selection.
3. Selection can be pinned to detail mode without losing grid context.
4. URL changes only when pinning the item as detail page.
5. When pinned, generates shareable URL and preserves view state on back.

## 19. Activity log

### 19.1 Purpose

Log everything relevant for enterprise feel.

### 19.2 What is logged

1. Agent executions and runs
2. Campaign status changes
3. Publications
4. Settings and integration changes
5. Sync errors
6. Destructive actions
7. Exports

**Rules:**

1. High-level vs debug events: default log shows only high-level.
2. Technical details are behind "view details".
3. All events in the same run share a run id and can be grouped.

### 19.3 Design

1. Dense chronological list.
2. Group by day with separators.
3. Filters by type, user, object, date.
4. Filters become persistent chips.
5. Each event has: what, who, when, context, and link to object.
6. Each event has simple visual status: success, warning, error, and clear CTA if action required.

## 23. Canonical screen

The canonical screen validates the system.

**Must include:**

1. Complete app shell.
2. Editable table with filters and search.
3. Right inspector with internal tabs.
4. Prompt to Output panel in split mode.
5. Toasts.
6. Confirmation modal.
7. Drawer for mobile editing.
8. Integration down banner.
9. Loading skeleton and empty state.

> **Rule:** Any new pattern must fit this screen without inventing new layout.
> **Rule:** The canonical screen must work without permanent overlays.
> **Rule:** All overlays close with Escape and only block work for destructive confirmations.
> **Rule:** Toasts, modals, drawer, banner, skeleton and empty use the same tokens and spacing.

## 24. Consistency test with 5 real flows

1. **Create something:** Create campaign from prompt and save as draft.
2. **Edit something:** Edit fields in table and confirm in inspector.
3. **Filter and search:** Apply filters, save view, find an item with search.
4. **Run prompt:** Run, see progress, handle error, partial retry, save output.
5. **Review result:** Approve and publish, then see event in activity log.

> If something feels off, go back to rules and tokens, do not patch a screen.

**Success criteria:**

1. **Time to first value:** In "Create something" and "Run prompt", first visible result within target time.
2. **Undo rate:** In "Edit something", undo from inspector or cell without losing context.
3. **State persistence:** In "Filter and search", on back, view, filters and selection are preserved.

## 30. Appendix: alignment with Attio without copying

**Inherited principles (verifiable rules):**

1. Persistent sidebar and main panel: never hidden on desktop.
2. Command palette as speed center: global shortcut, allows navigate, create, run and search in one place.
3. Data views as working form: editable table is the default pattern for collections.
4. Right inspector for detail without navigating: selection opens inspector, pinning generates URL.

**AI Wave differentiation (interface effects):**

1. Accent as focus and execution: run states and primary actions use the main accent.
2. Prompt to Output pattern visible: persistent split and outputs structured by type.
3. Activity log oriented to executions: run id visible and grouping by run.
4. Trust and control microcopy: always show what is happening, what was done, what is missing, and what the user can undo.

---

