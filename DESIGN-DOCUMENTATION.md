# SpendTab Design Documentation

## Overview
This document tracks the design system, typography, and visual changes made to the SpendTab financial management application.

## Color Palette

### Dashboard Cards
- **Top Metric Cards**: Alternating colors `#E6F1FD` and `#EDEEFC`
- **Chart & Overview Cards**: Light gray background `#F9F9FA`
  - Income vs Expenses Chart
  - Cash Flow Chart  
  - Recent Transactions
  - Budget Overview

### Dashboard Metric Cards
- **Primary Card Color**: `#E6F1FD` (Light blue)
- **Secondary Card Color**: `#EDEEFC` (Light purple/lavender)

#### Usage Pattern
Cards alternate between the two colors in sequence:
1. Revenue Card: `#E6F1FD`
2. Expenses Card: `#EDEEFC`
3. Profit Card: `#E6F1FD`
4. Cash Flow Card: `#EDEEFC`

## Typography

### Font Family
- **Primary Font**: Geist Sans (modern, clean typeface)
- **Fallback Stack**: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif

### Dashboard Metric Cards
- **Card Titles**: 
  - Mobile: `text-sm` (14px)
  - Tablet: `text-base` (16px)
  - Desktop: `text-base` (16px)
  - Font Weight: `font-medium`

- **Metric Values**:
  - Mobile: `text-xl` (20px)
  - Tablet: `text-2xl` (24px)
  - Desktop: `text-3xl` (30px)
  - Font Weight: `font-bold`

- **Subtitle Text**:
  - Mobile: `text-xs` (12px)
  - Tablet: `text-sm` (14px)
  - Desktop: `text-sm` (14px)
  - Color: `text-muted-foreground`

## Layout & Spacing

### Dashboard Metric Cards Grid
- **Grid Layout**: 
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 4 columns
- **Gap Spacing**:
  - Mobile: `gap-3` (12px)
  - Tablet: `gap-4` (16px)
  - Desktop: `gap-5` (20px)

### Card Padding
- **Header Padding**:
  - Mobile: `p-3` (12px)
  - Tablet: `p-4` (16px)
  - Desktop: `p-5` (20px)
  - Bottom: `pb-2` (8px)

- **Content Padding**:
  - Mobile: `p-3` (12px)
  - Tablet: `p-4` (16px)
  - Desktop: `p-5` (20px)
  - Top: `pt-0` (0px)

## Visual Effects

### Cards
- **Shadow**: `shadow-md` (medium shadow)
- **Border Radius**: Default card border radius
- **Background**: Inline styles with hex colors for precise color control

### Icons
- **Size**:
  - Mobile: `h-4 w-4` (16px)
  - Tablet: `h-5 w-5` (20px)
  - Desktop: `h-5 w-5` (20px)
- **Color**: `text-muted-foreground`

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)

### Grid Behavior
- Mobile: Single column layout for better readability
- Tablet: 2-column layout for optimal space usage
- Desktop: 4-column layout for full dashboard view

## Design Principles

### Color Strategy
- Alternating colors create visual rhythm and help distinguish between different metrics
- Light, subtle colors maintain readability while adding visual interest
- Colors are accessibility-friendly with sufficient contrast

### Typography Hierarchy
- Clear size progression from mobile to desktop
- Consistent font weights for similar content types
- Proper spacing for improved readability

### Spacing System
- Consistent padding and margin system using Tailwind's spacing scale
- Responsive spacing that adapts to screen size
- Adequate white space for clean, uncluttered appearance

## Change Log

### Latest Changes (Card Background Update)
- **Chart & Overview Cards**: Updated background color to `#F9F9FA` for:
  - Income vs Expenses Chart
  - Cash Flow Chart
  - Recent Transactions
  - Budget Overview
- **Purpose**: Improved visual hierarchy and subtle distinction from metric cards

### Font Update
- **Font Family**: Changed primary font from system fonts to Geist Sans
- **Implementation**: Updated Tailwind config and layout to use Geist font with proper CSS variable fallbacks
- **Benefits**: Improved typography consistency and modern appearance

### Latest Updates
- **Date**: [Current Date]
- **Changes Made**:
  - Updated dashboard metric cards with alternating background colors
  - Reduced card size from previous larger version
  - Applied colors `#E6F1FD` and `#EDEEFC` in alternating pattern
  - Adjusted typography sizes for better proportion
  - Updated spacing and padding for improved visual balance

### Previous Changes
- Initial implementation of larger dashboard cards with light blue background
- Typography improvements for better readability
- Responsive design implementation

## Future Considerations

### Potential Improvements
- Consider adding hover effects for better interactivity
- Explore dark mode color variants
- Evaluate accessibility compliance for color choices
- Consider animation transitions for state changes

### Maintenance Notes
- Colors are currently applied via inline styles for precise control
- Consider moving to CSS custom properties or Tailwind config for better maintainability
- Regular accessibility audits recommended
- Monitor user feedback for color preference and readability

---

*This document should be updated whenever design changes are made to maintain consistency and provide reference for future development.*