# Components

## 31. Component sources

**Primary (Core + Primitives + Components):**

1. **Core:** Tailwind CSS | Import: `bun add -d tailwindcss postcss autoprefixer`
2. **Primitives:** Radix UI | Import: `bun add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-radio-group @radix-ui/react-slider @radix-ui/react-context-menu`
3. **Components:** shadcn and Kibo UI | Import: `npx shadcn@latest init` + `https://www.kibo-ui.com/`

**Specialized (non-primary):**

1. **Data table:** TanStack Table | Import: `bun add @tanstack/react-table`
2. **Prompt UI:** Prompt-Kit | Import: `npx shadcn add "https://prompt-kit.com/c/[component].json"`
3. **Blocks/Components:** Blocks.so, shadcnblocks and Hexta UI | Import: `https://blocks.so/` + `https://shadcnblocks.com/` + `https://www.hextastudio.com/`
4. **Motion:** Framer Motion | Import: `bun add framer-motion`
5. **Charts:** Recharts and EvilCharts | Import: `bun add recharts` + `https://evilcharts.com/`
6. **Assets:** Nucleo Glass SVG Icons + Outpace Avatars | Import: `https://nucleoapp.com/svg-glass-icons` + `https://avatars.outpace.systems/`
7. **Icons:** HugeIcons (`@hugeicons/react`, `@hugeicons/core-free-icons`) | Import: `bun add @hugeicons/react @hugeicons/core-free-icons`

## 32. Required component list

### 32.1 Actions and controls

1. **Button (Primary)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
2. **Button (Secondary)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
3. **Button (Ghost)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
4. **Button (Outline)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
5. **Button (Link)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
6. **Button (Destructive)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
7. **Button (Accent)**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
8. **IconButton**: Core + Primitives + Components | Import: `npx shadcn@latest add button`
9. **Loading Button**: Components | Import: `npx shadcn@latest add button`
10. **Split Button**: Components | Import: `npx shadcn@latest add button` + `npx shadcn@latest add dropdown-menu`
11. **Toggle Button**: Components | Import: `npx shadcn@latest add toggle`
12. **Button Group**: Components | Import: `npx shadcn@latest add toggle-group`
13. **Dropdown Menu**: Primitives + Components | Import: `npx shadcn@latest add dropdown-menu`
14. **Command Palette**: Primitives + Components | Import: `npx shadcn@latest add command`

### 32.2 Inputs and forms

1. **Text Input**: Core + Primitives + Components | Import: `npx shadcn@latest add input`
2. **Email Input**: Core + Primitives + Components | Import: `npx shadcn@latest add input`
3. **Password Input**: Core + Primitives + Components | Import: `npx shadcn@latest add input`
4. **Number Input**: Core + Primitives + Components | Import: `npx shadcn@latest add input`
5. **Search Input**: Core + Primitives + Components | Import: `npx shadcn@latest add input`
6. **Textarea**: Core + Primitives + Components | Import: `npx shadcn@latest add textarea`
7. **Select (Single)**: Primitives + Components | Import: `npx shadcn@latest add select`
8. **Multi-Select**: Primitives + Components | Import: `npx shadcn@latest add select` + `npx shadcn@latest add badge`
9. **Combobox / Autocomplete**: Primitives + Components | Import: `npx shadcn@latest add command` + `npx shadcn@latest add popover`
10. **Date Picker**: Components | Import: `npx shadcn@latest add calendar` + `npx shadcn@latest add popover`
11. **Time Picker**: Components | Import: `npx shadcn@latest add input`
12. **Date Range Picker**: Components | Import: `npx shadcn@latest add calendar` + `npx shadcn@latest add popover`
13. **File Upload**: Components | Import: `npx shadcn@latest add input`
14. **Image Upload (preview)**: Components | Import: `npx shadcn@latest add input`
15. **Slider**: Primitives + Components | Import: `npx shadcn@latest add slider`
16. **Switch / Toggle**: Primitives + Components | Import: `npx shadcn@latest add switch`
17. **Checkbox**: Primitives + Components | Import: `npx shadcn@latest add checkbox`
18. **Radio Group**: Primitives + Components | Import: `npx shadcn@latest add radio-group`
19. **Tag Input / Tag Picker**: Components | Import: `npx shadcn@latest add badge` + `npx shadcn@latest add command`
20. **Currency Input**: Components | Import: `npx shadcn@latest add input`
21. **URL Input**: Components | Import: `npx shadcn@latest add input`
22. **Rich Text Editor**: Components | Import: `npx shadcn@latest add textarea`
23. **Code Editor**: Components | Import: `npx shadcn@latest add textarea`

### 32.3 Navigation

1. **Topbar**: Components | Import: `npx shadcn@latest add navigation-menu` + `npx shadcn@latest add button`
2. **Sidebar Navigation**: Components | Import: `npx shadcn@latest add accordion` + `npx shadcn@latest add scroll-area` + `npx shadcn@latest add button`
3. **Breadcrumbs**: Components | Import: `npx shadcn@latest add breadcrumb`
4. **Tabs**: Primitives + Components | Import: `npx shadcn@latest add tabs`
5. **Pagination**: Components | Import: `npx shadcn@latest add pagination`
6. **Stepper**: Components | Import: `npx shadcn@latest add progress` + `npx shadcn@latest add badge`
7. **Menu (Dropdown / Context)**: Primitives + Components | Import: `npx shadcn@latest add dropdown-menu` + `npx shadcn@latest add context-menu`
8. **Skip Links**: Components | Import: `custom: anchor + focus styles`

### 32.4 Overlays

1. **Tooltip**: Primitives + Components | Import: `npx shadcn@latest add tooltip`
2. **Popover**: Primitives + Components | Import: `npx shadcn@latest add popover`
3. **Modal Dialog**: Primitives + Components | Import: `npx shadcn@latest add dialog`
4. **Confirmation Dialog**: Primitives + Components | Import: `npx shadcn@latest add alert-dialog`
5. **Form Modal**: Components | Import: `npx shadcn@latest add dialog` + `npx shadcn@latest add form`
6. **Drawer**: Primitives + Components | Import: `npx shadcn@latest add sheet`
7. **Sidebar Overlay (mobile)**: Components | Import: `npx shadcn@latest add sheet`

### 32.5 Feedback and state

1. **Toast**: Components | Import: `npx shadcn@latest add toast`
2. **Alert / Banner**: Components | Import: `npx shadcn@latest add alert`
3. **Inline Error**: Components | Import: `npx shadcn@latest add form`
4. **Skeleton**: Components | Import: `npx shadcn@latest add skeleton`
5. **Loading State**: Components | Import: `npx shadcn@latest add skeleton`
6. **Empty State**: Blocks/Components | Import: `https://blocks.so/`
7. **Progress Bar**: Components + Motion | Import: `npx shadcn@latest add progress`
8. **Progress Circle**: Components + Motion | Import: `npx shadcn@latest add progress`
9. **Status Badge**: Components | Import: `npx shadcn@latest add badge`

### 32.6 Data display

1. **Data Table (sortable/filterable)**: Data table | Import: `bun add @tanstack/react-table`
2. **Virtual Table**: Data table | Import: `bun add @tanstack/react-virtual`
3. **Data Grid**: Data table | Import: `bun add @tanstack/react-table`
4. **Cell Renderers**: Data table + Components | Import: `bun add @tanstack/react-table`
5. **Badge**: Components | Import: `npx shadcn@latest add badge`
6. **Avatar**: Components | Import: `npx shadcn@latest add avatar`
7. **Tag / Chip**: Components | Import: `npx shadcn@latest add badge`
8. **Card (when applicable)**: Components | Import: `npx shadcn@latest add card`

### 32.7 Prompt UI

1. **Prompt Input**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/prompt-input.json"`
2. **Code Block**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/code-block.json"`
3. **Markdown**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/markdown.json"`
4. **Message**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/message.json"`
5. **Chat Container**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/chat-container.json"`
6. **Scroll Button**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/scroll-button.json"`
7. **Loader**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/loader.json"`
8. **Prompt Suggestion**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/prompt-suggestion.json"`
9. **Response Stream**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/response-stream.json"`
10. **Reasoning**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/reasoning.json"`
11. **File Upload**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/file-upload.json"`
12. **JSX Preview**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/jsx-preview.json"`
13. **Tool**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/tool.json"`
14. **Source**: Prompt UI | Import: `npx shadcn add "https://prompt-kit.com/c/source.json"`

### 32.8 Charts

1. **Line / Area / Bar**: Charts | Import:  
   1. **Dotted Background:** `npx shadcn@latest add https://evilcharts.com/chart/default-bar-chart.json` and `npx shadcn@latest add https://evilcharts.com/chart/default-multiple-bar-chart.json`
   2. **Hatched Bars:** `npx shadcn@latest add https://evilcharts.com/chart/hatched-bar-chart.json` and `npx shadcn@latest add https://evilcharts.com/chart/hatched-bar-multiple-chart.json`
   3. **Highlighted Bars:** `npx shadcn@latest add https://evilcharts.com/chart/highlighted-bar-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/highlighted-multiple-bar-chart.json`
   4. **Duotone Bars:** `npx shadcn@latest add https://evilcharts.com/chart/duotone-bar-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/duotone-bar-multiple-chart.json`
   5. **Gradient Bars:** `npx shadcn@latest add https://evilcharts.com/chart/gradient-bar-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/gradient-bar-multiple-chart.json`
   6. **Glowing Bars:** `npx shadcn@latest add https://evilcharts.com/chart/glowing-bar-chart.json`and`npx shadcn@latest add https://evilcharts.com/chart/glowing-bar-vertical-chart.json`
   7. **Animated:** `npx shadcn@latest add https://evilcharts.com/chart/monochrome-bar-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/value-line-bar-chart.json`
2. **Area**: Charts | Import:
   1. **Dotted Line:** `npx shadcn@latest add https://evilcharts.com/chart/gradient-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/gradient-rounded-chart.json`
   2. **Pattern Chart:** `npx shadcn@latest add https://evilcharts.com/chart/dotted-pattern-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/bar-pattern-chart.json`
   3. **Animated Hovering Chart:** `npx shadcn@latest add https://evilcharts.com/chart/animated-hatched-pattern-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/animated-highlighted-chart.json`
   4. **Animated Area Charts:** `npx shadcn@latest add https://evilcharts.com/chart/clipped-area-chart.json`
3. **Line**: Charts | Import:
   1. *Dotted Line*:** `npx shadcn@latest add https://evilcharts.com/chart/dotted-line.json`and `npx shadcn@latest add https://evilcharts.com/chart/dotted-multi-line.json`
   2. **Glowing Line:** `npx shadcn@latest add https://evilcharts.com/chart/glowing-line.json`and `npx shadcn@latest add https://evilcharts.com/chart/rainbow-glow-gradient-line.json`
   3. **Custom Dots:** `npx shadcn@latest add https://evilcharts.com/chart/pinging-dot-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/number-dot-chart.json`
   4. **Partial Line:** `npx shadcn@latest add https://evilcharts.com/chart/partial-line.json`
4. **Donut / Pie**: Charts | Import:
   1. **Rounded Pie:** `npx shadcn@latest add https://evilcharts.com/chart/rounded-pie-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/increase-size-pie-chart.json`
   2. **Radial Charts:** `npx shadcn@latest add https://evilcharts.com/chart/radial-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/glowing-radial-chart.json`
5. **Sparkline**: Charts | Import: Tiny Bar Chart
6. **Radar Charts**: Charts | Import:
   1. **Stroke Chart:** `npx shadcn@latest add https://evilcharts.com/chart/radial-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/stroke-multiple-radar-chart.json`
   2. **Glowing Stroke Chart:** `npx shadcn@latest add https://evilcharts.com/chart/glowing-stroke-radar-chart.json`and `npx shadcn@latest add https://evilcharts.com/chart/glowing-multiple-stroke-radar-chart.json`
   3. **Animated Clipped Radar Chart:** `npx shadcn@latest add https://evilcharts.com/chart/animated-clipped-radar-chart.json`

### 32.9 Blocks and sections

1. **Dashboard Blocks**: Blocks/Components | Import: `https://blocks.so/` + `https://shadcnblocks.com/` + `https://www.hextastudio.com/`
2. **Settings Sections**: Blocks/Components | Import: `https://blocks.so/` + `https://shadcnblocks.com/` + `https://www.hextastudio.com/`
3. **Empty / CTA Blocks**: Blocks/Components | Import: `https://blocks.so/` + `https://shadcnblocks.com/` + `https://www.hextastudio.com/`

### 32.10 Icons and assets

1. **Icon set**: Icons | Import: `bun add @hugeicons/react @hugeicons/core-free-icons`
2. **Glass SVG Icons (Nucleo)**: Assets | Import: `https://nucleoapp.com/svg-glass-icons`
3. **Outpace Avatars**: Assets | Import: `https://avatars.outpace.systems/`

## 33. Usage rules

1. All components follow tokens and rules from `design-system/02-foundations.md`.
2. Primary components come from Core + Primitives + Components; the rest is taken from the specialized libraries listed above.
3. No parallel libraries without system approval.
