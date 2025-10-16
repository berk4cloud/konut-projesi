# Plan4Flex Housing Management - Design Guidelines

## Design Approach
**Selected Approach**: Modern SaaS System Design inspired by Vercel, Linear, and Stripe
**Justification**: Professional B2B application requiring clean data visualization, clear hierarchy, and trustworthy aesthetics for multi-tenant workforce management.

## Core Design Principles
- **Clarity First**: Information density balanced with generous whitespace
- **Data Hierarchy**: Clear visual distinction between houses, rooms, and beds
- **Immediate Understanding**: Color-coded status system requires zero learning curve
- **Professional Trust**: Clean, minimal aesthetic builds credibility for B2B users

---

## Color Palette

### Brand & Interactive Colors (Light Mode)
- **Primary**: 219 94% 58% (Blue #2563eb) - Buttons, links, primary actions, active states
- **Primary Hover**: 219 94% 52% (Darker blue)
- **Primary Light**: 219 95% 95% (Background tints for primary elements)

### Status Colors (Fixed System)
- **Empty Beds**: 0 84% 60% (Red #ef4444) - Alerts users to availability
- **Occupied Beds**: 142 71% 45% (Green #10b981) - Confirms assignments
- **Out of Service**: 38 92% 50% (Amber #f59e0b) - Maintenance alerts
- **Reserved**: 271 91% 65% (Purple #a855f7) - Future bookings

### Neutral Palette
- **Text Primary**: 0 0% 9% (Gray-900 #171717)
- **Text Secondary**: 0 0% 45% (Gray-600 #525252)
- **Text Tertiary**: 0 0% 64% (Gray-500 #737373)
- **Border**: 0 0% 89% (Gray-200 #e5e5e5)
- **Background**: 0 0% 100% (White #ffffff)
- **Surface**: 0 0% 98% (Gray-50 #fafafa)
- **Surface Hover**: 0 0% 96% (Gray-100 #f5f5f5)

### Semantic Colors
- **Success**: 142 71% 45% (Green-500)
- **Warning**: 38 92% 50% (Amber-500)
- **Danger**: 0 84% 60% (Red-500)
- **Info**: 219 94% 58% (Blue-600)

---

## Typography

### Font Stack
**Primary**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Clean, modern, optimized for data-heavy interfaces
- Excellent readability at small sizes (critical for bed numbers, worker names)

### Type Scale & Usage
- **Display**: 36px/42px, font-weight 700 - Dashboard headers
- **H1**: 30px/36px, font-weight 600 - Page titles
- **H2**: 24px/32px, font-weight 600 - Section headers (House names)
- **H3**: 20px/28px, font-weight 600 - Card headers (Room numbers)
- **H4**: 18px/28px, font-weight 600 - Modal titles
- **Body Large**: 16px/24px, font-weight 400 - Primary content
- **Body**: 14px/20px, font-weight 400 - Standard text, labels
- **Small**: 12px/16px, font-weight 500 - Metadata, badges, bed numbers
- **Tiny**: 11px/16px, font-weight 600 - Status labels (all caps)

### Font Weight Usage
- **700 (Bold)**: Display text only
- **600 (Semibold)**: Headers, emphasis, button text
- **500 (Medium)**: Labels, small text requiring clarity
- **400 (Regular)**: Body text, descriptions

---

## Layout System

### Spacing Primitives
**Core Units**: 4, 8, 12, 16, 24, 32, 48, 64 (Tailwind: 1, 2, 3, 4, 6, 8, 12, 16)

### Container & Grid
- **Max Container Width**: 1440px (max-w-7xl)
- **Content Width**: 1280px (max-w-6xl) for main content areas
- **Narrow Content**: 720px (max-w-3xl) for modals, forms
- **Gutter**: 24px (p-6) on desktop, 16px (p-4) on tablet/mobile

### Grid Patterns
- **Dashboard Layout**: 12-column grid (gap-6)
- **Housing Cards**: 3 columns on large screens, 2 on tablet, 1 on mobile
- **Room Grid**: 4-6 columns within house card, auto-fit based on bed count
- **Filter Panel**: Stacked vertical on sidebar (320px wide)

### Vertical Rhythm
- **Section Spacing**: py-12 to py-16 between major sections
- **Card Spacing**: p-6 internal padding, gap-4 between cards
- **Component Spacing**: gap-3 for related elements, gap-6 for distinct sections

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Height: 64px (h-16)
- Background: White with subtle bottom border (border-gray-200)
- Logo left (max-h-8), user menu right
- Shadow: subtle (shadow-sm)

**Sidebar Filter Panel**:
- Width: 320px fixed on desktop, full-width drawer on mobile
- Background: Gray-50 (bg-gray-50)
- Sticky positioning: top-16 (below nav)
- Padding: p-6, gap-6 between filter groups

### Cards & Containers

**House Card**:
- Background: White
- Border: 1px solid gray-200 (border border-gray-200)
- Border Radius: 12px (rounded-xl)
- Padding: p-6
- Shadow: shadow-sm, hover:shadow-md transition
- Header: House name (H2), city (text-gray-500), bed count badge

**Room Card**:
- Background: Gray-50 (bg-gray-50)
- Border Radius: 8px (rounded-lg)
- Padding: p-4
- Header: Room number (H3 font-semibold), floor indicator, bed icons

**Bed Card/Badge**:
- Size: 48px × 48px minimum (w-12 h-12)
- Border Radius: 6px (rounded-md)
- Border: 2px solid (status color)
- Background: Status color at 10% opacity
- Content: Bed number (font-semibold text-xs)
- Hover: Lift with shadow-md, scale-105
- Occupied: Shows worker initials or icon in center

### Buttons

**Primary Button**:
- Background: Primary blue (bg-blue-600)
- Text: White (text-white)
- Padding: px-4 py-2 (medium), px-6 py-3 (large)
- Border Radius: 6px (rounded-md)
- Font: 14px semibold
- Hover: bg-blue-700, subtle lift (shadow-md)

**Secondary Button**:
- Background: White (bg-white)
- Border: 1px solid gray-300 (border-gray-300)
- Text: Gray-700 (text-gray-700)
- Same sizing as primary
- Hover: bg-gray-50, border-gray-400

**Icon Button**:
- Size: 36px × 36px (w-9 h-9)
- Background: Transparent or gray-100
- Border Radius: 6px (rounded-md)
- Icon: 20px (w-5 h-5)
- Hover: bg-gray-200

### Form Elements

**Input Fields**:
- Height: 40px (h-10)
- Border: 1px solid gray-300 (border-gray-300)
- Border Radius: 6px (rounded-md)
- Padding: px-3
- Font: 14px
- Focus: ring-2 ring-blue-500 border-blue-500
- Error: border-red-500 ring-red-500

**Select Dropdowns**:
- Same styling as inputs
- Chevron icon right-aligned
- Dropdown panel: bg-white, shadow-lg, border border-gray-200
- Options: px-3 py-2, hover:bg-gray-100

**Date Picker**:
- Calendar popup: shadow-xl, rounded-lg
- Selected date: bg-blue-600 text-white
- Today: border-2 border-blue-600
- Navigation: arrow buttons at top

### Modals & Dialogs

**Modal Container**:
- Max Width: 600px (max-w-2xl)
- Background: White
- Border Radius: 12px (rounded-xl)
- Padding: p-6
- Shadow: shadow-2xl
- Overlay: bg-black/50 backdrop-blur-sm

**Modal Header**:
- Title: H4 (18px semibold)
- Close button: top-right, icon-button style
- Bottom border: border-b border-gray-200
- Padding bottom: pb-4

**Modal Content**:
- Padding: py-6
- Max height: 70vh with scroll
- Form fields: gap-4 stacked

**Modal Footer**:
- Border top: border-t border-gray-200
- Padding: pt-4
- Actions: flex justify-end gap-3
- Primary action right-aligned

### Data Display

**Capacity Dashboard Widget**:
- Background: Gradient from blue-50 to blue-100
- Border Radius: 12px (rounded-xl)
- Padding: p-6
- Metrics: Large numbers (text-3xl font-bold) with labels (text-sm text-gray-600)
- Progress bars: h-2 rounded-full bg-gray-200, filled with status colors

**Status Badges**:
- Inline-flex items-center
- Padding: px-2 py-1 (px-2.5 py-0.5 for tiny)
- Border Radius: 9999px (rounded-full)
- Font: 11px uppercase semibold tracking-wide
- Color combinations:
  - Empty: bg-red-100 text-red-700
  - Occupied: bg-green-100 text-green-700
  - OOS: bg-amber-100 text-amber-700
  - Reserved: bg-purple-100 text-purple-700

**Gender Indicators**:
- Icon badges: 20px circle (w-5 h-5 rounded-full)
- Male: bg-blue-500 with ♂ symbol
- Female: bg-pink-500 with ♀ symbol
- Position: Top-right corner of bed card (absolute positioning)

### Alerts & Warnings

**Gender Warning Banner**:
- Background: Amber-50 (bg-amber-50)
- Border: 1px solid amber-300, left-border-4 amber-500
- Border Radius: 8px (rounded-lg)
- Padding: p-4
- Icon: Warning triangle (text-amber-600)
- Text: 14px with bold warning title
- Actions: Inline buttons (text-links or small buttons)

**Success Notification**:
- Background: Green-50 with green-500 left border
- Auto-dismiss after 3 seconds
- Slide-in from top-right
- Shadow: shadow-lg

---

## Animations

**Micro-interactions** (Framer Motion):
- Card hover: scale-[1.02] duration-200
- Button hover: scale-105 duration-150
- Modal entrance: fadeIn + slideUp (y: 20 to 0)
- Filter panel toggle: slideInLeft (x: -100% to 0)
- Status changes: pulse effect duration-300

**Loading States**:
- Skeleton cards: Animate pulse on bg-gray-200
- Spinner: Rotating circle (blue-600) for data fetching
- Lazy grid: Stagger children animation (delay 50ms each)

**Prohibited Animations**:
- No parallax scrolling
- No continuous animations
- No auto-playing carousels

---

## Responsive Behavior

### Desktop (1280px+)
- Full sidebar visible (320px)
- 3-column house grid
- Expanded bed cards with full details

### Tablet (768px - 1279px)
- Collapsible sidebar (hamburger menu)
- 2-column house grid
- Compact bed cards (icons only, name on hover)

### Mobile (<768px)
- Hidden sidebar (bottom sheet for filters)
- Single column stack
- Simplified bed grid (2-3 per row)
- Bottom navigation for actions

---

## Images & Media

**No Hero Images**: This is a data application - login page and dashboard are information-first with no decorative imagery.

**Icons**: Heroicons (outline for secondary actions, solid for primary/active states)
- 20px (w-5 h-5) for inline icons
- 24px (w-6 h-6) for buttons and headers

**Avatars**: Worker avatars (if added later) - 32px circles with initials fallback

---

## Accessibility

- **Focus States**: Always visible, 2px blue ring (ring-2 ring-blue-500)
- **Color Contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Status Indicators**: Never rely on color alone (icons + text labels)
- **Keyboard Navigation**: Tab order follows visual hierarchy, modal trapping
- **Screen Readers**: Proper ARIA labels for all interactive elements