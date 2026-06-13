---
name: Luminous Depth
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 12px
---

## Brand & Style
The design system is engineered for a premium, high-end financial experience tailored for students. It balances the sophistication of modern fintech with the vibrant energy of youth culture through a refined **Glassmorphism** aesthetic.

The personality is "Digital Luxury"—it feels expensive yet accessible, utilizing deep space, light refraction, and multi-layered translucency. The interface should evoke a sense of clarity, security, and forward-thinking innovation. High-performance visuals like background blurs and neon glows create a tactile, three-dimensional environment that makes managing finances feel like interacting with future-tech.

## Colors
The palette is rooted in a deep, obsidian base to provide maximum contrast for glass effects.

- **Primary:** Neon Blue (#3B82F6) is used exclusively for primary actions, success states, and interactive focal points. It should often be accompanied by an outer glow (bloom effect).
- **Surface Strategy:** Surfaces are not solid. They use varying opacities of white and blue overlays. 
- **Typography Colors:** Pure White (#FFFFFF) is reserved for high-hierarchy information and headers. Slate (#94A3B8) provides a soft, legible secondary tier for metadata and descriptions.
- **Accents:** Subtle blue tints in the glass layers help differentiate functional areas from static backgrounds.

## Typography
This design system utilizes **Inter** for its systematic, utilitarian precision and high legibility in low-light environments.

- **Headers:** Use Bold (700) weights with tight letter spacing for a high-impact, premium feel.
- **Financial Data:** Large currency displays should use `display-lg` with a pure white color to ensure they "pop" against the dark background.
- **Hierarchy:** Use `label-caps` for section headers (e.g., "RECENT TRANSACTIONS") to provide clear structural anchoring without overwhelming the glass cards.
- **Scale:** Maintain a clear vertical rhythm. On mobile, decrease the size of top-tier headlines to ensure content remains the primary focus.

## Layout & Spacing
The layout follows a strict 4px grid system to maintain mathematical harmony.

- **Mobile Philosophy:** Use a fluid column system (typically 4 columns) with a generous 20px side margin. 
- **Safe Zones:** Ensure all glass containers have a minimum internal padding of `md` (16px) to prevent content from touching the rounded corners.
- **Negative Space:** Embrace whitespace between cards to allow the background gradients or "blobs" to shine through the frosted layers, emphasizing the depth of the UI.

## Elevation & Depth
Depth is not communicated through traditional black shadows, but through **light refraction and layering**.

1.  **Level 0 (Base):** The dark background (#0F172A). Occasionally features soft, out-of-focus blue light orbs.
2.  **Level 1 (Standard Card):** `backdrop-filter: blur(20px)` with a 5% white overlay. A 1px border with a linear gradient (top-left: white 20%, bottom-right: transparent) creates a "glass edge."
3.  **Level 2 (Floating/Active):** `backdrop-filter: blur(40px)` with a 10% white overlay. Includes a subtle, soft blue outer glow (#3B82F6 at 15% opacity) to signify interaction or priority.
4.  **Shadows:** Use large, diffused "Ambient Glows" instead of shadows. These are colored light-casts that match the primary accent rather than dark occlusions.

## Shapes
The shape language is ultra-modern and soft. All main containers (cards, modals, input groups) must use the `2xl` (1.5rem) roundedness to achieve a friendly, premium aesthetic.

Small interactive elements like chips or indicators use `sm` (0.5rem). The extreme rounding of the larger containers is a signature of this design system, contrasting with the sharp, crisp typography of the Inter font family.

## Components
- **Glass Cards:** The core component. Must feature the frosted blur, subtle gradient border, and 2xl corner radius. Content inside should be high-contrast (White/Slate).
- **Primary Buttons:** High-saturation Blue (#3B82F6) with a subtle inner glow. On hover/active, the background blur behind the button should intensify.
- **Glass Inputs:** Semi-transparent fields with a 1px border that brightens to Primary Blue on focus. Labels should sit above the field in `label-caps`.
- **Chips:** Small, pill-shaped elements using a 10% Blue overlay with a 1px blue border. Ideal for transaction categories (e.g., "Food", "Rent").
- **Lists:** Items separated by thin, low-opacity lines (10% White). Tapping a list item should trigger a brief "light-up" effect rather than a simple color change.
- **Data Visualizations:** Charts should use neon-line styles with a "glow path" effect. The area under the line should be filled with a very faint, blue-tinted gradient.