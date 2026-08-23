# تک‌نقطه | ReFlow Web & PWA

> **Deep Focus, The Boulder Method & Guilt-Free Mindful Play**  
> Official Web/PWA edition with 1:1 parity with the core Flutter mobile application.

---

## 🌟 Core Philosophy & Features

- **🪨 The Boulder Method (تخته‌سنگ امروز)**: Focus on the single most critical high-impact task of the day with morning prediction calibration.
- **⏱️ Minimalist Dark Glass Focus Timer (تایمر تمرکز عمیق)**: Full-screen SVG countdown ring with glow effects, task banner, interrupt tagging, and Zeigarnik valve.
- **✨ Habits & 10-Second Friction Engineering (عادت‌ها و اصطکاک)**: Anchor cue habit building, streak recovery algorithms, and 10-second impulse delay for breaking bad habits.
- **🍃 Guilt-Free Mindful Play (تفریح بدون عذاب وجدان)**: Scheduled play intervals with Parkinson's Law antidote mechanism and boulder completion safety checks.
- **🧠 Universal Brain Dump (مخزن ذهن)**: Floating command palette for instant thought capture, classification, and one-tap task promotion.
- **🎨 Dynamic 6-Theme Palette**:
  - `Ember` (کهربایی `#EFA55C`)
  - `Night Iris` (شفق شبانه `#9F7AEA`)
  - `Alpine Pine` (سوزن کاج `#4EAF7B`)
  - `Abyssal Indigo` (نیلی ژرف `#5486EB`)
  - `Smoked Mulberry` (شاتوتی `#D65B6E`)
  - `Mist Slate` (گرانیت مه‌آلود `#A2ADC0`)
- **🌐 Bilingual Persian & English**: Complete RTL/LTR document layout adaptation with Shamsi calendar utilities.
- **⚡ Offline-First Architecture**: Powered by IndexedDB (Dexie.js) with zero external database dependencies, JSON export/backup, and PWA Service Worker caching.
- **☁️ Cloudflare Pages / Workers Ready**: Pre-configured with SPA routing fallbacks and immutable asset caching rules.

---

## 🏗 Architecture & Design Standards

- **Framework**: React 19 (Vite) + TypeScript + Tailwind CSS
- **Storage**: Dexie.js (Offline-First IndexedDB reactive storage)
- **Icons & Fonts**: `@mui/icons-material` + Vazirmatn (with full RTL/LTR bi-directional support)
- **Design System**: Liquid Glass aesthetic with CSS-variable-driven Dynamic 6-Accent Themes matching Flutter's `Tone` tokens.

---

## 🌐 ReFlow Web / PWA Roadmap & Delivery Checklist

### 📅 Phase-by-Phase Delivery Matrix

| Phase | Deliverable / Epic | Status | Target Timeline / ETA |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Core Scaffolding, Tone Tokens & Offline Dexie Schema | `Completed` | Milestone 1 (Done) |
| **Phase 2** | 1:1 Transpilation of Today, Habits, Leisure Views & Floating Navigation | `Completed` | Milestone 2 (Done) |
| **Phase 3** | Native Bottom Sheets (Settings, Task Edit, Time Picker, Evening Review) | `Completed` | Milestone 3 (Done) |
| **Phase 4** | Flutter Motion Physics, Transitions & Dynamic Theme Engine | `Completed` | Milestone 4 (Done) |
| **Phase 5** | Cloudflare Workers + D1 Backend Engine & Pairing API | `In Progress` | ETA: 3 Days |
| **Phase 6** | Multi-Device Delta Sync Client, PWA Service Worker & Production Deployment | `Upcoming` | ETA: 5 Days |

---

### ✅ 1:1 Feature Parity Checklist

- [x] **Offline-First CRUD via Dexie.js**: Zero initial server dependencies, all state saved in local browser IndexedDB.
- [x] **1:1 Today Dashboard**: Daily Boulder hero card, active task slots, and prediction calibration rate.
- [x] **Segmented Energy Level Check-in Widget**: Morning energy logging (`کم`, `متوسط`, `زیاد`) for golden hour pattern discovery.
- [x] **Evening Reflection Banner (`🌙 پایان روز`) & Modal Flow**: 60-second review with 3 Whys root cause analysis.
- [x] **Flush Anchored Floating Brain Dump / Vault Pill (`مخزن ذهن`)**: Pixel-perfect micro-alignment over the active Tasks tab.
- [x] **Responsive Floating Navigation**: Bottom Pill Bar for Mobile (< 768px) and Detached Floating Glass Rail for Tablet/Desktop (>= 768px).
- [x] **Adaptive Settings Architecture**: Native Modal Bottom Sheet (`z-50`) for Mobile and Dedicated 2-Column Wide View for Desktop.
- [x] **6-Accent Dynamic Palette Switcher**: Instant live DOM CSS variable token morphing across all surfaces.
- [x] **Persian (RTL) & English (LTR) Localization Parity**: Automatic direction, typography, and numeral formatting (`۰-۹`).
- [x] **Tactile Press Physics & Fluid Bottom Sheet Drag Transitions**: Emulated Flutter haptic press, spring checkmark pop, and swipe-to-dismiss gesture physics.
- [ ] **Cloudflare Workers & D1 Delta Sync Endpoints**: Serverless sync handlers (`/api/sync/push`, `/api/sync/pull`).
- [ ] **6-Digit Device Pairing & Ecosystem Link Flow**: Fast multi-device pairing without mandatory registration.
- [ ] **Web App Manifest & Offline Service Worker Asset Caching**: Full standalone installation support with background sync.
- [ ] **Automated CI/CD Deployment**: Push-to-deploy pipeline targeting Cloudflare Pages/Workers.

---

## 🎯 Quality Assurance & Engineering Targets

- **TypeScript Compilation**: Zero TypeScript errors and zero compilation warnings on `npm run build`.
- **Lighthouse Performance Score**: Target PWA compliance score > 95 across Performance, Accessibility, Best Practices, and SEO.
- **Cross-Platform Responsive Ergonomics**: Native touch responsiveness across iOS Safari, Android Chrome, and Desktop browsers.

---

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
