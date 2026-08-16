# Flow / تک‌نقطه (PWA)

> Production 1:1 Dart-to-TypeScript Transpilation of Taknoghte / Flow with Cloudflare Workers (Hono + D1), Offline-First Dexie.js IndexedDB, and Universal Responsive Liquid-Glass UI.

---

## 💎 Design System & Aesthetic Foundation

- **Deep Canvas Foundation**: `#060608` deep dark background.
- **Dynamic 6-Accent Palette**:
  - **Ember (`#EFA55C`)** — Default warm fire
  - **Alpine Pine (`#4EAF7B`)**
  - **Abyssal Indigo (`#5486EB`)**
  - **Smoked Mulberry (`#D65B6E`)**
  - **Mist Slate (`#A2ADC0`)**
  - **Night Iris (`#9F7AEA`)**
- **Liquid Glass Surfaces**: `glassA` (7.2%), `glassB` (3.0%), `line` (8.5%), `spec` (16%).
- **Multi-Platform Responsiveness**:
  - **Mobile (< 768px)**: 3-tab liquid glass bottom navigation bar with floating Brain Vault action button.
  - **Desktop / Tablet (>= 768px)**: Floating side navigation rail (RTL/LTR mirrored) and centered ergonomic container.

---

## 🚀 Key Features

1. **Today & The Boulder**:
   - Breathing ember ambient glow for active daily boulder.
   - Non-punitive task capacity formula ($3 \to 4 \to 5$ tasks unlocked by active days).
   - 3-level quick energy check-ins (Low, Med, High).
   - Strikethrough checkbox micro-animations with confetti rewards.

2. **Focus Arena**:
   - Circular SVG progress ring with wall-clock resilience surviving tab sleep and browser reload.
   - Zeigarnik valve thought capture drawer.
   - 5-tag interruption taxonomy (`phone`, `people`, `tired`, `thought`, `other`).
   - Time-up completion modal with +10 minute extensions.

3. **Habits & Mindful Friction**:
   - Active good habits with Anchor Cues (`بعد از [cue]`).
   - Non-punitive recovery tracking (1-day and 2-day missed recovery notes).
   - Bad habit friction sheet with 10-second countdown ring, long-term cost card, and replacement action.

4. **Guilt-Free Play**:
   - Configurable leisure block unlocked when the boulder falls.
   - Antidote to Parkinson's Law philosophy card.

5. **Morning Wizard & Evening Review**:
   - Morning planning ritual with star boulder selection & 10%-95% prediction slider.
   - Evening review with 3-level Why-chain root cause analysis for missed boulders.

6. **Stats Mirror & Weekly Review**:
   - Boulder Win Rate %, Optimism Gap, Habit Recovery Rate %, and Golden Hour.
   - 7-day focus minutes bar chart & 30-day ranked interruption patterns.
   - Zero-based review flow: *"If it wasn't on the list today, would you add it again?"*

7. **Cloudflare Workers & D1 Sync**:
   - Zero-knowledge pairing keys.
   - Delta sync endpoints (`/api/sync/push`, `/api/sync/pull`).
   - JSON export & restore backup engine.

---

## 🛠️ Development & Build

```bash
# Run local Vite development server
npm run dev

# Compile TypeScript & Build Production Bundle
npm run build

# Cloudflare Worker dev & deploy
npm run worker:dev
npm run worker:deploy
```
