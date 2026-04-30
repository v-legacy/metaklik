# Design Document

## Overview

The Link Preview UI feature transforms the `/links` page into a conversion-optimized, user-friendly interface for testing and demonstrating link metadata extraction capabilities. The design follows a progressive disclosure pattern: starting with a compelling hero section that communicates value, followed by an interactive input area, and finally displaying results in both technical (meta tags column) and visual (preview card) formats.

The implementation leverages Next.js 14 App Router, React Server Components where appropriate, and the existing shadcn/ui component library with Tailwind CSS. The design prioritizes performance, accessibility, and responsive behavior across all device sizes.

## Architecture

### Component Hierarchy

```
/links (Page Component)
├── HeroSection
│   ├── Headline
│   ├── Subheadline
│   └── Feature Highlights
├── LinkInputSection
│   ├── URLInput (with validation)
│   ├── SubmitButton
│   └── ErrorMessage (conditional)
└── ResultsSection (conditional)
    ├── MetaTagsColumn
    │   └── MetaTagItem[] (label-value pairs)
    └── PreviewCard
        ├── PreviewImage (or placeholder)
        ├── PreviewTitle
        ├── PreviewDescription
        └── PreviewSiteName
```

### Data Flow

1. User enters URL in input field
2. Client-side validation occurs on input change
3. On submit, POST request sent to `/api/links/metadata`
4. Loading state displayed during API call
5. On success: metadata stored in component state, ResultsSection rendered
6. On error: error message displayed, ResultsSection hidden

### State Management

The page will use React's `useState` and `useTransition` hooks for local state management:

- `url`: string - current input value
- `metadata`: MetadataResult | null - extracted metadata
- `error`: string | null - error message
- `isLoading`: boolean - loading state
- `isPending`: boolean - transition state for optimistic UI

## Components and Interfaces

### 1. LinkPreviewPage (Main Page Component)

**Location:** `src/app/links/page.tsx`

**Type:** Client Component (`'use client'`)

**Responsibilities:**
- Orchestrate all child components
- Manage state for URL input, metadata results, loading, and errors
- Handle form submission and API calls
- Coordinate responsive layout

**Props:** None (page component)

**State:**
```typescript
interface PageState {
  url: string;
  metadata: MetadataResult | null;
  error: string | null;
  isLoading: boolean;
}
```

### 2. HeroSection Component

**Location:** `src/app/links/_components/HeroSection.tsx`

**Type:** Client Component

**Responsibilities:**
- Display compelling headline and value proposition
- Render feature highlights with icons
- Provide visual hierarchy and brand messaging

**Props:**
```typescript
interface HeroSectionProps {
  className?: string;
}
```

**Copywriting Content:**
- Headline: "Extract Link Metadata in Seconds"
- Subheadline: "Instantly preview how your links will appear across social media, messaging apps, and search engines"
- Features:
  - "Lightning Fast" - Get metadata in under 2 seconds
  - "Comprehensive Data" - Extract Open Graph, Twitter Cards, and more
  - "Social Media Ready" - See exactly how links will display

### 3. LinkInputSection Component

**Location:** `src/app/links/_components/LinkInputSection.tsx`

**Type:** Client Component

**Responsibilities:**
- Render URL input field with validation
- Display submit button with loading state
- Show inline error messages
- Handle form submission

**Props:**
```typescript
interface LinkInputSectionProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  className?: string;
}
```

**Validation Rules:**
- URL must not be empty
- URL must start with http:// or https://
- URL must have valid domain format
- Real-time validation feedback

### 4. MetaTagsColumn Component

**Location:** `src/app/links/_components/MetaTagsColumn.tsx`

**Type:** Client Component

**Responsibilities:**
- Display all extracted metadata fields
- Format field labels and values
- Handle missing/null values
- Make URLs clickable

**Props:**
```typescript
interface MetaTagsColumnProps {
  metadata: MetadataResult;
  className?: string;
}
```

**Display Fields:**
- Title
- Description
- Image URL (clickable)
- Site Name
- URL (clickable)
- Video URL (if present, clickable)
- Type (if present)

### 5. PreviewCard Component

**Location:** `src/app/links/_components/PreviewCard.tsx`

**Type:** Client Component

**Responsibilities:**
- Render visual preview resembling social media link cards
- Display image with fallback
- Show title, description, site name
- Provide hover effects

**Props:**
```typescript
interface PreviewCardProps {
  metadata: MetadataResult;
  className?: string;
}
```

**Visual Design:**
- Card with border and shadow
- Image at top (16:9 aspect ratio, max height 300px)
- Title (font-semibold, 2 line clamp)
- Description (text-muted-foreground, 3 line clamp)
- Site name (text-sm, text-muted-foreground)
- Hover: subtle shadow increase and border color change

### 6. ResultsSection Component

**Location:** `src/app/links/_components/ResultsSection.tsx`

**Type:** Client Component

**Responsibilities:**
- Orchestrate split layout between MetaTagsColumn and PreviewCard
- Handle responsive stacking
- Manage spacing and alignment

**Props:**
```typescript
interface ResultsSectionProps {
  metadata: MetadataResult;
  className?: string;
}
```

## Data Models

### MetadataResult (Existing Interface)

```typescript
interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}
```

### API Response Types

```typescript
interface SuccessResponse {
  success: true;
  data: MetadataResult;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: 'INVALID_URL' | 'UNREACHABLE' | 'TIMEOUT' | 'PARSE_ERROR' | 'UNKNOWN';
}

type APIResponse = SuccessResponse | ErrorResponse;
```

### Form State

```typescript
interface FormState {
  url: string;
  isValid: boolean;
  validationError: string | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: URL validation consistency

*For any* string input, if the input fails client-side URL validation, then submitting the form should not trigger an API call
**Validates: Requirements 2.2, 2.5**

### Property 2: Loading state exclusivity

*For any* component state, the loading indicator should be visible if and only if an API request is in progress
**Validates: Requirements 2.4**

### Property 3: Results display completeness

*For any* successful metadata extraction, all non-null metadata fields should be displayed in the MetaTagsColumn
**Validates: Requirements 3.2, 3.3**

### Property 4: Error message mapping

*For any* API error response, the displayed error message should correspond to the error code returned by the API
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 5: Responsive layout breakpoint

*For any* viewport width, the split layout should display side-by-side when width > 768px and stacked when width ≤ 768px
**Validates: Requirements 5.1, 5.3**

### Property 6: Preview card image fallback

*For any* metadata result where image is null, the preview card should display a placeholder image or icon
**Validates: Requirements 4.4**

### Property 7: Accessibility focus order

*For any* keyboard navigation sequence, the focus order should follow the visual order: hero → input → button → results
**Validates: Requirements 7.2**

### Property 8: Input field state preservation

*For any* URL input, the input value should persist in the field after form submission regardless of success or failure
**Validates: Requirements 2.2**

## Error Handling

### Client-Side Validation Errors

**Trigger:** Invalid URL format before submission

**Handling:**
- Display inline error message below input field
- Use red text color (destructive variant)
- Prevent form submission
- Clear error on valid input

**Error Messages:**
- Empty input: "Please enter a URL"
- Invalid format: "Please enter a valid URL starting with http:// or https://"

### API Errors

**Error Code: INVALID_URL**
- Message: "The URL format is invalid. Please check and try again."
- Display: Error alert below input section

**Error Code: UNREACHABLE**
- Message: "Unable to reach the URL. Please check if the website is accessible."
- Display: Error alert below input section

**Error Code: TIMEOUT**
- Message: "The request timed out. The website may be slow or unavailable."
- Display: Error alert below input section

**Error Code: PARSE_ERROR**
- Message: "Could not extract metadata from this URL. The page may not have proper meta tags."
- Display: Error alert below input section

**Error Code: UNKNOWN**
- Message: "An unexpected error occurred. Please try again."
- Display: Error alert below input section

### Network Errors

**Trigger:** Failed fetch request (network offline, CORS, etc.)

**Handling:**
- Catch in try-catch block
- Display generic error message
- Log error to console for debugging

**Message:** "Network error. Please check your connection and try again."

## Testing Strategy

### Unit Tests

**Test File:** `src/app/links/_components/__tests__/`

**Coverage:**

1. **HeroSection.test.tsx**
   - Renders headline and subheadline
   - Displays all feature highlights
   - Applies custom className

2. **LinkInputSection.test.tsx**
   - Renders input field with placeholder
   - Calls onUrlChange when input changes
   - Calls onSubmit when form submitted
   - Displays error message when error prop provided
   - Disables button when isLoading is true
   - Shows loading spinner when isLoading is true

3. **MetaTagsColumn.test.tsx**
   - Renders all metadata fields with labels
   - Displays "Not available" for null values
   - Makes URLs clickable with proper href
   - Hides optional fields when not present

4. **PreviewCard.test.tsx**
   - Renders image when provided
   - Shows placeholder when image is null
   - Displays title with proper line clamping
   - Displays description with proper line clamping
   - Shows site name

5. **ResultsSection.test.tsx**
   - Renders MetaTagsColumn and PreviewCard
   - Applies split layout classes
   - Passes metadata to child components

### Property-Based Tests

**Test File:** `src/app/links/__tests__/link-preview.property.test.tsx`

**Framework:** fast-check (JavaScript/TypeScript property-based testing library)

**Configuration:** Minimum 100 iterations per property

**Tests:**

1. **Property 1: URL validation consistency**
   - Generate random invalid URL strings
   - Verify no API call triggered on submit
   - **Validates: Requirements 2.2, 2.5**

2. **Property 2: Loading state exclusivity**
   - Generate random component states
   - Verify loading indicator visibility matches isLoading state
   - **Validates: Requirements 2.4**

3. **Property 3: Results display completeness**
   - Generate random MetadataResult objects
   - Verify all non-null fields rendered in MetaTagsColumn
   - **Validates: Requirements 3.2, 3.3**

4. **Property 4: Error message mapping**
   - Generate all possible error codes
   - Verify correct error message displayed for each code
   - **Validates: Requirements 6.2, 6.3, 6.4**

5. **Property 5: Responsive layout breakpoint**
   - Generate random viewport widths
   - Verify layout matches expected configuration
   - **Validates: Requirements 5.1, 5.3**

6. **Property 6: Preview card image fallback**
   - Generate MetadataResult with null image
   - Verify placeholder displayed
   - **Validates: Requirements 4.4**

7. **Property 7: Accessibility focus order**
   - Simulate keyboard navigation
   - Verify focus order matches visual order
   - **Validates: Requirements 7.2**

8. **Property 8: Input field state preservation**
   - Generate random URL inputs
   - Submit form and verify input value persists
   - **Validates: Requirements 2.2**

### Integration Tests

**Test File:** `src/app/links/__tests__/link-preview.integration.test.tsx`

**Coverage:**
- Full user flow: enter URL → submit → view results
- API mocking with MSW (Mock Service Worker)
- Test both success and error scenarios
- Verify responsive behavior at different breakpoints

### Accessibility Tests

**Tools:** @testing-library/jest-dom, axe-core

**Coverage:**
- ARIA labels present and correct
- Keyboard navigation works
- Focus indicators visible
- Color contrast meets WCAG AA
- Semantic HTML structure

## Visual Design Specifications

### Layout

**Container:**
- Max width: 1200px
- Padding: 24px (mobile), 48px (desktop)
- Centered horizontally

**Hero Section:**
- Padding: 64px 0 48px 0 (desktop)
- Padding: 48px 0 32px 0 (mobile)
- Text alignment: center
- Background: subtle gradient or solid

**Input Section:**
- Padding: 32px 0
- Max width: 600px
- Centered horizontally

**Results Section:**
- Padding: 48px 0
- Grid: 2 columns (desktop), 1 column (mobile)
- Gap: 32px

### Typography

**Hero Headline:**
- Font size: 48px (desktop), 32px (mobile)
- Font weight: 700 (bold)
- Line height: 1.2
- Color: foreground

**Hero Subheadline:**
- Font size: 20px (desktop), 18px (mobile)
- Font weight: 400 (normal)
- Line height: 1.5
- Color: muted-foreground

**Feature Highlights:**
- Font size: 16px
- Font weight: 600 (semibold)
- Color: foreground

**Meta Tag Labels:**
- Font size: 14px
- Font weight: 600 (semibold)
- Color: foreground

**Meta Tag Values:**
- Font size: 14px
- Font weight: 400 (normal)
- Color: muted-foreground

**Preview Card Title:**
- Font size: 18px
- Font weight: 600 (semibold)
- Line clamp: 2
- Color: foreground

**Preview Card Description:**
- Font size: 14px
- Font weight: 400 (normal)
- Line clamp: 3
- Color: muted-foreground

### Colors

Using Tailwind CSS design tokens:
- Primary: `bg-primary`, `text-primary`
- Foreground: `text-foreground`
- Muted: `text-muted-foreground`
- Border: `border-border`
- Card: `bg-card`
- Destructive: `text-destructive` (errors)

### Spacing

- Section gaps: 48px (desktop), 32px (mobile)
- Component gaps: 24px
- Element gaps: 16px
- Tight gaps: 8px

### Animations

**Button Hover:**
- Transition: all 200ms ease
- Transform: subtle scale or shadow increase

**Card Hover:**
- Transition: all 200ms ease
- Shadow: increase from sm to md
- Border: color shift to primary

**Loading Spinner:**
- Animation: spin 1s linear infinite
- Size: 20px
- Color: primary

**Form Submission:**
- Use React's useTransition for optimistic UI
- Fade in results: opacity 0 → 1, duration 300ms

## Responsive Breakpoints

**Mobile:** < 768px
- Single column layout
- Stacked components
- Full width elements
- Reduced padding and font sizes

**Tablet:** 768px - 1024px
- Two column layout for results
- Moderate padding
- Standard font sizes

**Desktop:** > 1024px
- Two column layout for results
- Maximum container width
- Optimal spacing and typography

## Accessibility Considerations

### Semantic HTML

- Use `<main>` for page content
- Use `<section>` for major areas
- Use `<form>` for input section
- Use `<article>` for preview card
- Use proper heading hierarchy (h1, h2, h3)

### ARIA Labels

- Input field: `aria-label="Enter URL to extract metadata"`
- Submit button: `aria-label="Extract metadata"`
- Loading state: `aria-busy="true"` on form
- Error messages: `aria-live="polite"` for announcements
- Results section: `aria-label="Metadata extraction results"`

### Keyboard Navigation

- All interactive elements focusable
- Visible focus indicators (ring-2 ring-primary)
- Logical tab order
- Enter key submits form
- Escape key clears errors (optional enhancement)

### Screen Reader Support

- Announce loading state changes
- Announce error messages
- Announce successful extraction
- Provide context for each metadata field
- Describe preview card structure

### Color Contrast

- All text meets WCAG AA (4.5:1 for normal text)
- Interactive elements have sufficient contrast
- Error messages use both color and text
- Focus indicators visible against all backgrounds

## Performance Considerations

### Code Splitting

- Lazy load ResultsSection component
- Lazy load PreviewCard image component
- Use dynamic imports for heavy dependencies

### Image Optimization

- Use Next.js Image component for preview images
- Lazy load images below the fold
- Provide proper width/height to prevent layout shift
- Use blur placeholder for loading state

### API Optimization

- Debounce URL input (optional enhancement)
- Cache API responses (optional enhancement)
- Use SWR or React Query for data fetching (optional enhancement)

### Bundle Size

- Tree-shake unused UI components
- Minimize client-side JavaScript
- Use Server Components where possible (hero section)

## Future Enhancements

1. **URL History:** Save recently checked URLs in localStorage
2. **Copy to Clipboard:** Add buttons to copy metadata values
3. **Share Results:** Generate shareable link to results
4. **Batch Processing:** Allow multiple URLs at once
5. **Export Data:** Download metadata as JSON or CSV
6. **Dark Mode:** Ensure all components support dark theme
7. **Analytics:** Track popular domains and error rates
8. **Rate Limiting:** Display remaining API calls
9. **Advanced Options:** Toggle which metadata fields to extract
10. **Comparison Mode:** Compare metadata from multiple URLs side-by-side
