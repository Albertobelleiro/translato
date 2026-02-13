# Translato — UI Plan

## Overview
A dark, minimal two-panel translator UI inspired by Linear's design language. Source text on the left, translated output on the right, with auto-translate on typing (debounced). Built with React via Bun's HTML import, plain CSS custom properties, fully responsive.

## File Structure
```
frontend/
├── frontend.tsx          # React entry — renders <App /> into #root
├── App.tsx               # Root component, all state lives here
├── components/
│   ├── TranslatorPanel.tsx   # Reusable panel (source or target mode)
│   ├── LanguageSelector.tsx  # Filterable dropdown with flag emoji
│   ├── SwapButton.tsx        # Animated ↔ icon between selectors
│   ├── TextArea.tsx          # Auto-resizing textarea
│   ├── CopyButton.tsx        # Copy-to-clipboard on target panel
│   └── CharCount.tsx         # Character count badge
├── hooks/
│   └── useTranslate.ts       # Debounced fetch to /api/translate
├── constants/
│   └── languages.ts          # Language list: { code, name, flag }
└── styles/
    └── app.css               # Single CSS file, custom properties
```

## Components

### App
- **File:** `frontend/App.tsx`
- **State:** `{ sourceText, targetText, sourceLang, targetLang, isLoading, error }`
- **Behavior:** Holds all state via `useReducer`. Passes callbacks down. Calls `useTranslate` hook.
- [ ] Define reducer with actions: `SET_SOURCE_TEXT`, `SET_TARGET_TEXT`, `SET_SOURCE_LANG`, `SET_TARGET_LANG`, `SET_LOADING`, `SET_ERROR`, `SWAP_LANGS`
- [ ] Wire `useTranslate(sourceText, sourceLang, targetLang)` → dispatches `SET_TARGET_TEXT` / `SET_ERROR`
- [ ] Render two `TranslatorPanel` components side-by-side with `SwapButton` between language selectors
- [ ] Add `Cmd+Enter` global keydown listener to force-translate immediately

### TranslatorPanel
- **File:** `frontend/components/TranslatorPanel.tsx`
- **Props:** `mode: "source" | "target"`, `text`, `lang`, `onTextChange?`, `onLangChange`, `isLoading`, `languages`
- [ ] Render `LanguageSelector` at top, `TextArea` below
- [ ] If `mode === "source"`: show `CharCount` bottom-left, clear button (✕) bottom-right
- [ ] If `mode === "target"`: show `CopyButton` bottom-right, display loading skeleton when `isLoading`
- [ ] Target textarea is `readOnly`

### LanguageSelector
- **File:** `frontend/components/LanguageSelector.tsx`
- **Props:** `value`, `onChange`, `languages`, `showAutoDetect?: boolean`
- [ ] Render a button showing current `flag + name` that opens a dropdown
- [ ] Dropdown: text input at top for filtering, scrollable list below
- [ ] Each option: flag emoji + language name, highlight on hover
- [ ] Close on outside click or Escape key
- [ ] If `showAutoDetect`, prepend "🌐 Auto-detect" option with value `""`

### SwapButton
- **File:** `frontend/components/SwapButton.tsx`
- **Props:** `onSwap`, `disabled` (disabled when source is auto-detect)
- [ ] Render `⇄` icon centered between the two language selectors
- [ ] On click: call `onSwap`, apply 180° rotation CSS transition (200ms ease)
- [ ] Alternate rotation direction on successive clicks via local state toggle

### TextArea
- **File:** `frontend/components/TextArea.tsx`
- **Props:** `value`, `onChange?`, `readOnly?`, `placeholder`
- [ ] Auto-resize height to content using `scrollHeight` on input event
- [ ] Min-height: 200px, max-height: 60vh
- [ ] Dark background, no visible border, subtle bottom-border on focus
- [ ] Smooth opacity transition when `readOnly` text changes (fade in new text)

### CopyButton
- **File:** `frontend/components/CopyButton.tsx`
- **Props:** `text`
- [ ] Icon-only button (clipboard icon), on click: `navigator.clipboard.writeText(text)`
- [ ] Show brief "Copied!" tooltip for 1.5s after copy, then revert

### CharCount
- **File:** `frontend/components/CharCount.tsx`
- **Props:** `count`, `max?` (default 128000)
- [ ] Display `count / max` in secondary text color
- [ ] Turn accent/red when count > 90% of max

## Hook: useTranslate
- **File:** `frontend/hooks/useTranslate.ts`
- [ ] Accept `(sourceText, sourceLang, targetLang)`, return `{ translatedText, detectedLang, isLoading, error }`
- [ ] Debounce 400ms — reset timer on every sourceText change
- [ ] Skip fetch if sourceText is empty (clear targetText instead)
- [ ] `POST /api/translate` with JSON body, parse response
- [ ] Abort previous in-flight request via `AbortController` before starting new one

## Styling
- [ ] Define CSS custom properties in `:root` — `--bg: #0A0A0B`, `--surface: #1A1A1E`, `--border: rgba(255,255,255,0.06)`, `--text-primary: #EDEDEF`, `--text-secondary: #8E8E93`, `--accent: #7C5CFC`
- [ ] 8px spacing grid (`--space-1: 8px` through `--space-6: 48px`)
- [ ] Font: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`
- [ ] All transitions: `150ms ease`
- [ ] No box-shadows — only `1px solid var(--border)` on surfaces
- [ ] Responsive: single-column stack below `768px`, side-by-side above

## Interactions
- [ ] Typing in source → debounced auto-translate (no submit button)
- [ ] Loading state: pulse animation on target panel (CSS `@keyframes pulse` on background)
- [ ] Swap button: swap `sourceLang ↔ targetLang` and `sourceText ↔ targetText` simultaneously
- [ ] Language dropdown closes on selection, outside click, or Escape
- [ ] Clear button (✕): clears source text and target text
- [ ] Error state: subtle red text below target textarea, auto-dismiss after 5s
