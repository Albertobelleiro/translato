# Foundations

## 4. Typography

### 4.1 Single Typeface Family

**Single Typeface:** Inter (variable).

> **Rule:** Typeface families do not change for at least 6 months.

### 4.2 Base Weight, Style, and Size

- **Global base:** Inter 500, normal style, 14px, line-height 20px.
- **Single exception:** sidebar header (logo + name) in Inter 600, normal style, 16px, line-height 20px.

### 4.3 Closed Typography Scale

Units in `px`, with fixed `line-height` and controlled `tracking`.

| Style | Size (px) | Line Height (px) | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Base UI** | 14 | 20 | 500 | 0 |
| **Sidebar Header** | 16 | 20 | 600 | 0 |

**Rules:**

1. All UI text uses **Base UI** except for the sidebar exception.
2. Do not use alternate styles without system approval.

### 4.4 Typography in Data UI

1. **Tabular numbers** enabled by default for metrics and tables.
2. **Monospace** only for ids, logs, and technical snippets.

## 5. Size Scales

### 5.1 Spacing System

Closed system in `px`.

`0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64`

**Rules:**

1. Do not use values outside the scale.
2. Base component padding is **8px** or **12px**, depending on density.
3. Vertical separation between sections: **24px** or **32px**.

### 5.2 Radii System

Closed system in `px`.

`0, 6, 10, 14`

**Rules:**

1. **Inputs, buttons, pills:** 10px
2. **Cards, panels, modals:** 14px
3. **Menus, tooltips:** 10px
4. **Tables and cells:** 0px, except containers.

### 5.3 Border System

1. **Border width:** 1px by default.
2. **Strong border width:** 2px only for focus or critical selection.

**Rules:**

1. Border is the main separation mechanism.
2. Shadow is used only in overlays.

### 5.4 Elevation System

Maximum 3 levels.

- **0:** Flat
- **1:** Soft overlay
- **2:** Strong overlay
- **3:** Critical modal

> **Rule:** On normal surfaces, prefer border over shadow.

## 6. Color

### 6.1 Color Philosophy

Neutrals first. Brand after. States last.

### 6.2 Base Palette by Theme

**Light base**

- `base_bg`: #FFFFFF
- `base_sidebar`: #FBFBFB
- `base_stroke`: #FBFBFB
- `base_icons`: #505154
- `base_text`: #242529
- `base_hover`: #EEEFF1

**Dark base**

- `base_bg`: #1A1D21
- `base_sidebar`: #15181C
- `base_stroke`: #2F3033
- `base_icons`: #A1A4A7
- `base_text`: #EEEFF1
- `base_hover`: #242529

### 6.3 Primary Accent and Scales

**Dark accent primitives** (base = `500`)

- `accent_50`: #ECF2FF
- `accent_100`: #BDD2FF
- `accent_200`: #99B7FF
- `accent_300`: #769BFF
- `accent_400`: #4D76FF
- `accent_500`: #4D76FF
- `accent_600`: #3756BE
- `accent_700`: #253B87
- `accent_800`: #142355
- `accent_900`: #070F2E
- `accent_950`: #010412

**Light accent primitives** (base = `500`)

- `accent_50`: #E4EDFF
- `accent_100`: #A3C1FD
- `accent_200`: #719CF9
- `accent_300`: #3F75F2
- `accent_400`: #0036E6
- `accent_500`: #0036E6
- `accent_600`: #0025AB
- `accent_700`: #00187A
- `accent_800`: #000B4C
- `accent_900`: #000328
- `accent_950`: #00010F

**Rules:**

1. The accent base is always `500`.
2. Accent only for primary actions, focus, and active selection.
3. For text on accent, always use white text.

### 6.4 State Colors

- `success_700`: #15803D
- `warning_700`: #B45309
- `error_700`: #B91C1C
- `info_700`: #0369A1

**Rules:**

1. States only for badges, icons, banners, and feedback.
2. Never turn state into layout color.
3. State stroke should be barely visible: minimal difference from the background.
4. State text uses the state color, keeping harmonious contrast with base text.

### 6.5 Semantic Tokens by Theme

Semantic tokens, not by value.

#### 6.5.1 Light theme tokens

- `color_bg_canvas` = base_bg
- `color_bg_surface` = base_bg
- `color_bg_sidebar` = base_sidebar
- `color_bg_hover` = base_hover
- `color_bg_selected` = base_hover
- `color_text_primary` = base_text
- `color_text_secondary` = base_icons
- `color_text_muted` = base_icons
- `color_text_inverse` = #FFFFFF
- `color_border_subtle` = base_stroke
- `color_border_strong` = base_stroke
- `color_accent_primary` = accent_500
- `color_accent_focus` = accent_500
- `color_accent_hover` = accent_400
- `color_accent_pressed` = accent_600
- `color_accent_subtle_bg` = accent_50
- `color_state_success` = success_700
- `color_state_warning` = warning_700
- `color_state_error` = error_700
- `color_state_info` = info_700
- `color_state_success_bg` = success_700 / 12%
- `color_state_success_border` = success_700 / 18%
- `color_state_success_text` = success_700
- `color_state_warning_bg` = warning_700 / 12%
- `color_state_warning_border` = warning_700 / 18%
- `color_state_warning_text` = warning_700
- `color_state_error_bg` = error_700 / 12%
- `color_state_error_border` = error_700 / 18%
- `color_state_error_text` = error_700
- `color_state_info_bg` = info_700 / 12%
- `color_state_info_border` = info_700 / 18%
- `color_state_info_text` = info_700
- `color_state_default` = base_bg
- `color_state_hover` = base_hover
- `color_state_pressed` = base_hover
- `color_state_selected` = base_hover
- `color_state_disabled_bg` = base_bg
- `color_state_disabled_text` = base_icons
- `color_state_focus` = accent_500

#### 6.5.2 Dark theme tokens

- `color_bg_canvas` = base_bg
- `color_bg_surface` = base_bg
- `color_bg_sidebar` = base_sidebar
- `color_bg_hover` = base_hover
- `color_bg_selected` = base_hover
- `color_text_primary` = base_text
- `color_text_secondary` = base_icons
- `color_text_muted` = base_icons
- `color_text_inverse` = #1A1D21
- `color_border_subtle` = base_stroke
- `color_border_strong` = base_stroke
- `color_accent_primary` = accent_500
- `color_accent_focus` = accent_500
- `color_accent_hover` = accent_400
- `color_accent_pressed` = accent_600
- `color_accent_subtle_bg` = accent_900
- `color_state_success` = success_700
- `color_state_warning` = warning_700
- `color_state_error` = error_700
- `color_state_info` = info_700
- `color_state_success_bg` = success_700 / 16%
- `color_state_success_border` = success_700 / 22%
- `color_state_success_text` = success_700
- `color_state_warning_bg` = warning_700 / 16%
- `color_state_warning_border` = warning_700 / 22%
- `color_state_warning_text` = warning_700
- `color_state_error_bg` = error_700 / 16%
- `color_state_error_border` = error_700 / 22%
- `color_state_error_text` = error_700
- `color_state_info_bg` = info_700 / 16%
- `color_state_info_border` = info_700 / 22%
- `color_state_info_text` = info_700
- `color_state_default` = base_bg
- `color_state_hover` = base_hover
- `color_state_pressed` = base_hover
- `color_state_selected` = base_hover
- `color_state_disabled_bg` = base_bg
- `color_state_disabled_text` = base_icons
- `color_state_focus` = accent_500

### 6.6 Contrast Rules

1. **Normal text:** Minimum AA 4.5:1.
2. **Large text:** Minimum 3:1.
3. **UI components and icons:** Minimum 3:1 against their environment.
4. **Always visible focus:** The focus indicator must be clearly distinguishable from the unfocused state.

## 7. Interaction Tokens

### 7.1 Base states

**Tokens:**

- `state_default`
- `state_hover`
- `state_pressed`
- `state_selected`
- `state_disabled`
- `state_focus`

**Global rules:**

1. **Hover** only on interactive elements. Never on passive text.
2. **Pressed** reduces contrast and shifts 1px on the Y axis when applicable.
3. **Selected** defines active context, not just aesthetics.
4. **Disabled** always reduces contrast and disables cursor and keyboard.
5. **Focus ring** is never removed. If there is visual conflict, adjust layout.

### 7.2 Focus visible

**Focus ring:**

1. **Width:** 2px
2. **Offset:** 2px
3. **Color:** `color_accent_focus`
4. If the background is similar to the ring, use double ring: 2px accent and 1px neutral inner border.

### 7.3 Hover and selection in lists and tables

1. **Row hover:** Subtle change of `bg_panel` and subtle border.
2. **Row selection:** 2px left border in accent and `bg_subtle`.
3. **Multi-selection:** Visible checkbox, bulk actions in toolbar.

## 8. Motion

### 8.1 Principle

Motion only confirms actions and state changes. It does not ornament.

### 8.2 Duration tokens

- `motion_fast`: 120ms
- `motion_medium`: 180ms
- `motion_slow`: 240ms

**Rules:**

1. **Hover:** `motion_fast`
2. **Popover and tooltip open:** `motion_fast`
3. **Drawer:** `motion_medium`
4. **Modal:** `motion_medium`
5. **Full view change:** `motion_slow` only if it prevents visual jump.

### 8.3 Easing

- `easing_standard`: `cubic_bezier(0.2, 0, 0, 1)`
- `easing_exit`: `cubic_bezier(0.4, 0, 1, 1)`

### 8.4 Reduced motion

Respect `prefers_reduced_motion`.

> If active: remove movement and reduce to 120ms fade.

## 22. Minimum accessibility from the start

### 22.1 Contrast

- Meet minimum AA for text and UI.
- Tokens and variants are tested in light and dark.

### 22.2 Focus

1. Always visible.
2. Complete keyboard navigation.
3. Logical tab order.

### 22.3 Keyboard first

1. Command palette available on any screen.
2. Shortcuts visible in tooltips when applicable.
3. In tables: arrows navigate, Enter edits, Escape closes.

### 22.4 User preferences

1. Reduced motion.
2. Browser text size.
3. High contrast when possible.

---

