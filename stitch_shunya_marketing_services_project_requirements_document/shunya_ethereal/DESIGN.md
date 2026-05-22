# Design System Specification: The Luminous Archive

## 1. Overview & Creative North Star
**Creative North Star: "The Luminous Archive"**
This design system is engineered to move Shunya Marketing Services away from the static, "templated" nature of traditional agencies and into a realm of high-performance editorial digital experiences. It treats the interface as a living, breathing canvas where data and creativity intersect.

To achieve this, we leverage **Intentional Asymmetry**. Do not feel forced to align every element to a rigid vertical grid. Allow high-contrast typography to break boundaries, and use overlapping "Glassmorphism" layers to create a sense of three-dimensional depth. This is "Soft Minimalism"—where the interface is quiet enough to feel premium, but energetic enough to feel futuristic through neon accents and kinetic blurs.

---

## 2. Colors & Surface Logic
The palette is rooted in a warm, sophisticated base, contrasted by high-energy neon strikes.

### Surface Hierarchy & The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to separate sections. Boundaries are defined by background shifts or depth layers.
*   **The Base:** Use `surface` (#f7f6f2) for the primary page background.
*   **The Inset:** Use `surface-container-low` (#f1f1ed) for large secondary content blocks (e.g., a case study section).
*   **The Lift:** Use `surface-container-lowest` (#ffffff) for card elements to create a natural, "paper-on-table" lift.

### The "Glass & Gradient" Rule
To capture the "High-Growth" personality, we use two signature treatments:
1.  **Neon Glows:** Apply a linear gradient from `primary` (#6a1cf6) to `secondary` (#00647a) for primary actions.
2.  **Translucent Glass:** For floating UI elements (navbars, tooltips), use `surface-container-lowest` at 70% opacity with a `backdrop-filter: blur(16px)`. This allows the background "energy" to bleed through while maintaining legibility.

---

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance technical precision with premium aesthetics.

*   **Display & Headlines:** **Plus Jakarta Sans.** Used for `display-lg` through `headline-sm`. This font conveys authority. Use tight letter-spacing (-0.02em) and high contrast. Do not be afraid to use `display-lg` (3.5rem) for short, punchy statements.
*   **Body & Utility:** **Inter.** Used for `title-lg` through `label-sm`. Inter provides the "Apple-level" clean aesthetic required for long-form marketing copy and functional labels.

**The Hierarchy Rule:** Always pair a large `display-md` headline with a significantly smaller `body-md` subline. This dramatic scale difference is what creates the "Premium Editorial" feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We define depth through light physics and layering.

### The Layering Principle
Instead of shadows, stack your tokens:
1.  **Level 0 (Floor):** `surface`
2.  **Level 1 (Sub-section):** `surface-container-low`
3.  **Level 2 (Floating Card):** `surface-container-lowest` (White)

### Ambient Shadows
When a component must "float" (e.g., a primary CTA card), use a shadow tinted with the `on-surface` color:
*   **Values:** `X: 0, Y: 20px, Blur: 40px, Spread: -10px`. 
*   **Opacity:** 4% to 6%. It should be felt, not seen.

### The "Ghost Border"
For glassmorphic components where contrast against the background is low, apply a "Ghost Border":
*   **Token:** `outline-variant` (#adadaa) at 15% opacity. This creates a microscopic "edge" that catches light without looking like a box.

---

## 5. Component Guidelines

### Buttons: Kinetic Energy
*   **Primary:** Pill-shaped (`rounded-full`). Background is a gradient of `primary` to `primary-container`. Text is `on-primary`. On hover, add a subtle outer glow using the `primary` color at 20% opacity.
*   **Secondary:** Pill-shaped. `outline-variant` (Ghost Border) with `title-sm` text. No fill.
*   **Tertiary:** Text-only (`title-sm`) with an animated underline that expands from the center on hover.

### The Glass Navbar
*   **Position:** Sticky/Fixed.
*   **Style:** `surface-container-lowest` at 80% opacity.
*   **Blur:** `backdrop-blur: 24px`.
*   **Edge:** A bottom Ghost Border (10% opacity `outline-variant`).

### Cards & Content Lists
*   **The No-Divider Rule:** Explicitly forbid horizontal lines between list items. Use `spacing-4` (1.4rem) of vertical white space or a subtle hover state shift to `surface-container-high`.
*   **Card Geometry:** Use `rounded-xl` (1.5rem) for all main content cards to soften the futuristic aesthetic.

### Input Fields
*   **State:** Surface should be `surface-container-low`. 
*   **Focus State:** The Ghost Border transitions to a 1px solid `primary` glow.

---

## 6. Do's and Don'ts

### Do:
*   **Use Whitespace as a Tool:** If a section feels crowded, increase the spacing to `spacing-16` or `spacing-20`.
*   **Overlap Elements:** Place a Glassmorphic chip so it partially overlaps an image and the background. This creates "Signature Depth."
*   **Color as Accent:** Keep 90% of the UI in the neutral `surface` / `on-surface` range. Reserve neons strictly for high-conversion zones.

### Don't:
*   **Don't use pure black:** Use `on-surface` (#2e2f2d) for text to maintain the "Warm White" premium feel.
*   **Don't use 1px solid borders:** It breaks the "Luminous" effect. If you need separation, use color.
*   **Don't use standard easing:** Use `cubic-bezier(0.23, 1, 0.32, 1)` (Apple-style ease-out) for all glass transitions and hover states.

---
*Director's Note: Every pixel should feel like it was placed with a purpose. If a component feels "standard," go back to the Surface Hierarchy and see if you can define it through tone rather than structure.*