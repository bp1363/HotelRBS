# HotelRBS Design System v2.0
## Travel-Inspired UI/UX Redesign

---

## 🎨 Color Palette

### Primary Colors (Brand Identity)
- **Primary Brand**: `#006C35` (Deep Forest Green) - Trust, luxury, travel
  - HSL: `152 100% 21%`
  - Usage: Primary CTAs, brand elements, headers
  - Hover: `#005229` (Darker shade)
  
- **Secondary Brand**: `#FF6B35` (Warm Coral) - Energy, excitement, action
  - HSL: `14 100% 60%`
  - Usage: Accent buttons, special offers, highlights
  - Hover: `#E85A2B`

### Neutral Palette
- **Pure White**: `#FFFFFF` - Clean backgrounds
- **Off-White**: `#FAFAFA` - Secondary backgrounds
- **Light Gray**: `#F5F5F5` - Card backgrounds, sections
- **Mid Gray**: `#E0E0E0` - Borders, dividers
- **Text Gray**: `#757575` - Secondary text
- **Dark Charcoal**: `#212121` - Primary text
- **Deep Black**: `#000000` - High contrast text

### Accent Colors
- **Sky Blue**: `#0288D1` - Information, links
- **Success Green**: `#4CAF50` - Success states, confirmations
- **Warning Orange**: `#FF9800` - Warnings, urgent info
- **Error Red**: `#F44336` - Errors, cancellations
- **Purple**: `#9C27B0` - Premium, luxury features

### Gradient Overlays
- **Hero Gradient**: `linear-gradient(135deg, rgba(0,108,53,0.8) 0%, rgba(0,108,53,0.4) 100%)`
- **Card Gradient**: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)`
- **Shimmer**: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`

---

## 📝 Typography

### Font Families
- **Primary Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Display Font**: `'Poppins', 'Inter', sans-serif` (for headings)
- **Monospace**: `'Roboto Mono', monospace` (for codes, numbers)

### Font Sizes & Hierarchy
```css
/* Display (Hero Headlines) */
--font-display-xl: 4rem (64px) / line-height: 1.1 / weight: 700
--font-display-lg: 3rem (48px) / line-height: 1.2 / weight: 700
--font-display-md: 2.5rem (40px) / line-height: 1.2 / weight: 600

/* Headings */
--font-h1: 2.25rem (36px) / line-height: 1.25 / weight: 700
--font-h2: 1.875rem (30px) / line-height: 1.3 / weight: 600
--font-h3: 1.5rem (24px) / line-height: 1.35 / weight: 600
--font-h4: 1.25rem (20px) / line-height: 1.4 / weight: 600
--font-h5: 1.125rem (18px) / line-height: 1.5 / weight: 500

/* Body Text */
--font-body-lg: 1.125rem (18px) / line-height: 1.6 / weight: 400
--font-body: 1rem (16px) / line-height: 1.6 / weight: 400
--font-body-sm: 0.875rem (14px) / line-height: 1.5 / weight: 400
--font-caption: 0.75rem (12px) / line-height: 1.4 / weight: 400

/* CTA & Buttons */
--font-cta: 1rem (16px) / line-height: 1.5 / weight: 600
```

### Responsive Typography
- **Mobile (320px-768px)**: Reduce by 15-20%
- **Tablet (768px-1024px)**: Base sizes
- **Desktop (1024px+)**: Base or increase by 10%

---

## 🔲 Spacing System

### Base Unit: 4px
```
--space-0: 0px
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
```

### Container Widths
- **Mobile**: 100% (320px-768px)
- **Tablet**: 768px-1024px
- **Desktop**: 1280px max-width
- **Wide**: 1536px max-width
- **Full-Width Sections**: 100% with padding

### Gutter/Padding
- **Mobile**: 16px horizontal
- **Tablet**: 24px horizontal
- **Desktop**: 48px horizontal
- **Wide**: 64px horizontal

---

## 🎯 Component Guidelines

### Buttons

#### Primary Button (CTA)
- **Background**: Primary Brand Color
- **Text**: White, 16px, 600 weight
- **Padding**: 12px 32px
- **Border-radius**: 8px
- **Shadow**: 0 2px 8px rgba(0,108,53,0.2)
- **Hover**: Darker shade + lift effect (translateY(-2px))
- **Active**: Scale(0.98)
- **Min Touch Target**: 44px height

#### Secondary Button
- **Background**: Transparent
- **Border**: 2px solid Primary
- **Text**: Primary Color
- **Hover**: Background = Primary/10

#### Text Button
- **No background**
- **Underline on hover**
- **Primary color text**

### Cards

#### Hotel Card
- **Background**: White
- **Border-radius**: 12px
- **Shadow**: 0 2px 12px rgba(0,0,0,0.08)
- **Hover Shadow**: 0 8px 24px rgba(0,0,0,0.15)
- **Transition**: 0.3s ease-out
- **Image aspect-ratio**: 4:3
- **Padding**: 16px

### Inputs

#### Text Input / Search Bar
- **Height**: 48px (mobile), 56px (desktop)
- **Border**: 1px solid #E0E0E0
- **Border-radius**: 8px
- **Font-size**: 16px (prevent zoom on iOS)
- **Padding**: 12px 16px
- **Focus**: Border = Primary + shadow
- **Placeholder**: #9E9E9E

### Modals/Dialogs
- **Max-width**: 640px
- **Border-radius**: 16px
- **Backdrop**: rgba(0,0,0,0.5) blur(4px)
- **Padding**: 32px
- **Animation**: Fade in + scale from 0.95

---

## 🎬 Animations & Transitions

### Timing Functions
```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1)
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1)
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1)
```

### Duration
- **Fast**: 150ms - Small UI changes
- **Normal**: 300ms - Standard transitions
- **Slow**: 500ms - Page transitions, complex animations

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card Hover Lift */
.card-hover {
  transition: transform 0.3s, box-shadow 0.3s;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.15);
}
```

---

## 📱 Mobile-First Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm - Large phones */ }
@media (min-width: 768px) { /* md - Tablets */ }
@media (min-width: 1024px) { /* lg - Small laptops */ }
@media (min-width: 1280px) { /* xl - Desktops */ }
@media (min-width: 1536px) { /* 2xl - Large screens */ }
```

### Touch Targets
- **Minimum**: 44x44px (iOS)
- **Recommended**: 48x48px
- **Ideal**: 56x56px for primary actions

---

## 🛡️ Trust & Accessibility

### Trust Elements
- **Secure Booking Badge**: Display SSL/security icons
- **Verified Partners**: Show certification badges
- **24/7 Support**: Prominent phone/chat icons
- **Money-Back Guarantee**: Trust seals

### Accessibility (WCAG AA Minimum)
- **Color Contrast**: 4.5:1 for text, 3:1 for large text
- **Focus States**: Visible outlines (2px solid Primary)
- **Alt Text**: All images must have descriptive alt
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML, ARIA labels

---

## 🎯 UI Patterns

### Hero Section
- **Full-width background image** with overlay
- **Center-aligned search bar** (prominent)
- **Height**: 60vh (mobile), 70vh (desktop)
- **Text**: Large, bold, white with shadow

### Search Bar (Primary)
- **Frosted glass effect**: backdrop-blur(10px)
- **Shadow**: Large, soft shadow for depth
- **Inputs**: Side-by-side on desktop, stacked on mobile
- **CTA Button**: Prominent, colorful, right-aligned

### Card Layouts
- **Grid**: 1 col (mobile), 2 col (tablet), 3-4 col (desktop)
- **Gap**: 16px (mobile), 24px (desktop)
- **Lazy Load**: Images load as user scrolls

### Navigation
- **Desktop**: Horizontal, center-aligned
- **Mobile**: Hamburger or bottom tab bar
- **Sticky**: Header sticks on scroll (compact version)

---

## 🚀 Performance Guidelines

- **Images**: WebP format, lazy loading, srcset for responsive
- **Animations**: Use CSS transforms (GPU accelerated)
- **Load Time**: < 3 seconds on 4G
- **Core Web Vitals**: 
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## 📚 Component Library Checklist

✅ **Buttons**: Primary, Secondary, Text, Icon, Loading states
✅ **Cards**: Hotel, Destination, Deal, Review
✅ **Inputs**: Text, Search, Date Picker, Select, Checkbox, Radio
✅ **Navigation**: Header, Footer, Breadcrumbs, Pagination
✅ **Modals**: Booking, Login, Confirmation, Info
✅ **Forms**: Search form, Booking form, Contact form
✅ **Feedback**: Toast notifications, Loading spinners, Progress bars
✅ **Media**: Image gallery, Video player, Maps
✅ **Lists**: Hotel listings, Search results, Filters

---

## 🎨 Brand Voice

- **Friendly**: Warm, welcoming tone
- **Professional**: Trust and reliability
- **Adventurous**: Inspire travel and exploration
- **Clear**: No jargon, easy to understand
- **Supportive**: Always helpful, never pushy

