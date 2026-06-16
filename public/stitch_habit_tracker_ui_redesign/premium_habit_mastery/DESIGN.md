---
name: Premium Habit Mastery
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 48px
---

## Brand & Style

The design system is engineered to evoke a sense of **calm productivity and incremental mastery**. It targets high-achieving individuals who value efficiency and visual clarity. The aesthetic is rooted in **Modern SaaS** principles: a sophisticated blend of minimalist functionalism and premium polish.

The interface prioritizes psychological safety and motivation through:
- **Generous Whitespace:** To reduce cognitive load and maintain focus on current tasks.
- **Micro-interactions:** Subtle transitions that provide immediate positive reinforcement for habit completion.
- **Professionalism:** A reliable, institutional feel that suggests a serious tool for serious growth, avoiding overly "gamified" or loud visuals.

## Colors

The palette is anchored by **Deep Slate (Primary)**, providing a sophisticated and stable foundation for text and structural elements. **Emerald Green (Secondary)** is reserved strictly for success states, completed habits, and positive trend lines to build a strong psychological association between the color and achievement.

**Vibrant Blue (Tertiary)** serves as the functional action color—used for primary buttons, active navigation states, and interactive charts. The **Slate Gray (Neutral)** scale is utilized for secondary text and borders to maintain a low-contrast, non-distracting hierarchy. 

Backgrounds use a very slight off-white (`#F8FAFC`) to reduce eye strain compared to pure white, while "Surface" elements (cards, inputs) remain pure white to "pop" against the background.

## Typography

This design system employs a tiered typography strategy to balance character with utility. 

- **Hanken Grotesk** is used for headlines to provide a sharp, contemporary "tech-forward" personality.
- **Inter** is the workhorse for all body copy and UI elements, chosen for its exceptional legibility and neutral tone.
- **JetBrains Mono** is used sparingly for metadata, "streak" counts, and secondary labels to introduce a precise, "tracked" feel that aligns with data visualization.

Maintain strict vertical rhythm by adhering to the defined line heights. Use `label-caps` for section headers within cards and `display-lg` exclusively for dashboard welcome messages or milestone achievements.

## Layout & Spacing

The system follows a **12-column fluid grid** for desktop, transitioning to a **single-column stack** for mobile. 

- **The Dashboard Layout:** Features a 3-column top row for quick-stats, followed by a wide central column for the habit list and a right-hand sidebar for "Trends & Insights" on desktop.
- **Spacing Rhythm:** Use a strict 8px base grid. Components should use 16px or 24px internal padding. 
- **The "Breathe" Rule:** Ensure that major sections (e.g., "Today's Habits" vs "Weekly Overview") are separated by at least 48px to prevent the UI from feeling cluttered. 
- **Mobile Adjustments:** Margins shrink to 16px, and all cards become full-width to maximize the touch-target area for habit checking.

## Elevation & Depth

Visual hierarchy is established through a **Tonal Layering** approach combined with **Ambient Shadows**.

- **Level 0 (Background):** `#F8FAFC`. The canvas.
- **Level 1 (Cards/Containers):** White background with a very soft, diffused shadow (`0 4px 6px -1px rgba(0, 0, 0, 0.05)`). This level is for habit items, calendar views, and stats.
- **Level 2 (Modals/Dropdowns):** White background with a more pronounced shadow (`0 10px 15px -3px rgba(0, 0, 0, 0.1)`) and a 1px border of `#E2E8F0` to ensure separation from Level 1.
- **Interactive Depth:** When a habit card is "checked," it should lose its shadow and slightly dim in opacity (0.8), visually "settling" into the background to indicate completion.

## Shapes

The shape language is **Refined and Rounded**. A `0.5rem` (8px) base radius is applied to cards and input fields to strike a balance between professional geometry and approachable softness.

- **Buttons:** Use the standard `rounded` (8px) for primary actions, but use `pill-shaped` for status chips (e.g., "Daily", "Weekly", "Streak Count") to differentiate them from interactive buttons.
- **Checkboxes:** Habit checkboxes should be large (min 28px) with a `0.5rem` radius, feeling more like "mini-cards" than traditional form elements.

## Components

### Buttons
- **Primary:** Solid `#3B82F6` with white text. No gradient. High-contrast and clear.
- **Secondary:** Transparent background with a `1px` border of `#E2E8F0`. Text in `#0F172A`.
- **Completion Toggle:** A large custom checkbox that fills with `#10B981` and a checkmark icon upon click.

### Habit Cards
Habit cards should feature a left-aligned icon (representing the habit category), the habit name in `headline-md`, and a bottom row of status chips. The right side is reserved for the large completion toggle.

### Progress Visualization
- **Streaks:** Use a small flame icon paired with `label-caps` JetBrains Mono text.
- **Weekly Heatmap:** Small 24x24px squares with a radius of `4px`. Use a 5-step color scale from `#F1F5F9` (0%) to `#10B981` (100%).

### Inputs
- **Text Fields:** Subtle gray border (`#CBD5E1`), 12px vertical padding. Focus state uses a `2px` ring of Tertiary Blue.
- **Category Selectors:** Horizontal scrollable list of icons with text labels, using a "segmented control" style.

### Feedback Toasts
Success toasts for habit completion should appear at the bottom-center, using a soft Emerald Green background (`#ECFDF5`) and Emerald text to reinforce the success color without being intrusive.