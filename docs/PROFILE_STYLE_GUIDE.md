# Profile Screen Style Guide

## 1. Design Philosophy
The profile screen follows a "Clean & Modern" aesthetic, prioritizing readability, hierarchy, and ease of use. It uses a card-based layout on a subtle background to separate content sections effectively.

## 2. Color Palette
The design uses the centralized theme system (`src/theme/colors.js`).

| Token | Color | Usage |
|-------|-------|-------|
| `colors.primary` | `#2563eb` (Blue) | Primary actions, active borders, icons, brand moments |
| `colors.accent` | `#f59e0b` (Amber) | Secondary actions, highlights |
| `colors.text` | `#111827` (Dark Gray) | Main headings, body text |
| `colors.muted` | `#6b7280` (Gray) | Placeholders, helper text, subtitles |
| `colors.border` | `#e5e7eb` (Light Gray) | Input borders, dividers |
| `colors.danger` | `#ef4444` (Red) | Error states, validation messages |
| `colors.pageBg` | `#f5f7fb` (Off-white) | Main background |
| `colors.cardBg` | `#ffffff` (White) | Content cards |

## 3. Typography
- **Headings:** Bold weight (`700`), Dark text. Used for the user name and section titles.
- **Body:** Regular weight (`400`), Dark text. Used for inputs.
- **Labels:** Semi-bold (`600`), 14px. Used for input labels.
- **Subtitles/Helpers:** Regular, Muted color, 12-14px.

## 4. Components

### Input Field
- **Default State:** 1.5px Border (`colors.border`), Light background.
- **Focus State:** Animates to `colors.primary` border, icon highlights.
- **Error State:** `colors.danger` border, error message below input.
- **Accessibility:** Includes `accessibilityLabel` and `accessibilityHint`.

### Buttons
- **Primary Button:** Full width, rounded corners (12px), `colors.primary` background, white text, shadow.
- **Secondary Button:** Outline style, `colors.accent` border/text.

### Layout
- **Cards:** White background, 16px border radius, subtle shadow (`shadowOpacity: 0.05`).
- **Spacing:** 
  - Section vertical margin: 24px
  - Input vertical margin: 16px
  - Content padding: 20px

## 5. Animations
- **Focus:** Input borders animate smoothly (200ms) between default and primary colors.
- **Transitions:** `LayoutAnimation` is used when saving to smooth out layout changes.

## 6. Responsiveness
- The layout uses Flexbox and percentage-based widths to adapt to different screen sizes.
- `KeyboardAvoidingView` ensures inputs remain visible on mobile devices.
