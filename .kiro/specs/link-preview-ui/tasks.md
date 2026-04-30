# Implementation Plan

- [x] 1. Create HeroSection component with copywriting
  - Create `src/app/links/_components/HeroSection.tsx` with headline, subheadline, and feature highlights
  - Use Tailwind CSS for responsive typography and spacing
  - Implement center-aligned layout with proper padding
  - Add feature icons using Lucide React or similar icon library
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write unit tests for HeroSection component
  - Test that headline and subheadline render correctly
  - Test that all three feature highlights are displayed
  - Test that custom className is applied
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create LinkInputSection component with validation
  - Create `src/app/links/_components/LinkInputSection.tsx` with form, input field, and submit button
  - Implement client-side URL validation using regex or URL constructor
  - Add real-time validation feedback with error message display
  - Use existing Input and Button components from ui directory
  - Implement loading state with spinner on submit button
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for URL validation consistency
  - **Property 1: URL validation consistency**
  - **Validates: Requirements 2.2, 2.5**

- [ ]* 2.2 Write unit tests for LinkInputSection component
  - Test input field renders with placeholder
  - Test onUrlChange callback is called on input change
  - Test onSubmit callback is called on form submission
  - Test error message displays when error prop is provided
  - Test button is disabled when isLoading is true
  - Test loading spinner shows when isLoading is true
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Create MetaTagsColumn component
  - Create `src/app/links/_components/MetaTagsColumn.tsx` to display metadata fields
  - Render each metadata field with label and value in a list format
  - Handle null/undefined values by displaying "Not available" or hiding field
  - Make URL fields clickable with proper href attributes
  - Use Card component from ui directory for container
  - Apply proper spacing and typography using Tailwind classes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for results display completeness
  - **Property 3: Results display completeness**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 3.2 Write unit tests for MetaTagsColumn component
  - Test all metadata fields render with labels
  - Test "Not available" displays for null values
  - Test URLs are clickable with proper href
  - Test optional fields are hidden when not present
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 4. Create PreviewCard component with image fallback
  - Create `src/app/links/_components/PreviewCard.tsx` to display visual preview
  - Use Card component from ui directory as base
  - Render image at top with 16:9 aspect ratio (use Next.js Image component)
  - Implement placeholder image or icon when image is null
  - Display title with 2-line clamp, description with 3-line clamp
  - Display site name at bottom with muted styling
  - Add hover effects (shadow increase, border color change)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for preview card image fallback
  - **Property 6: Preview card image fallback**
  - **Validates: Requirements 4.4**

- [ ]* 4.2 Write unit tests for PreviewCard component
  - Test image renders when provided
  - Test placeholder shows when image is null
  - Test title displays with proper line clamping
  - Test description displays with proper line clamping
  - Test site name displays
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 5. Create ResultsSection component with split layout
  - Create `src/app/links/_components/ResultsSection.tsx` to orchestrate layout
  - Implement two-column grid layout for desktop (> 768px)
  - Implement stacked layout for mobile (≤ 768px)
  - Use Tailwind responsive classes (md:grid-cols-2)
  - Render MetaTagsColumn and PreviewCard as children
  - Apply proper gap spacing (32px) between columns
  - Align both columns at the top
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 Write property test for responsive layout breakpoint
  - **Property 5: Responsive layout breakpoint**
  - **Validates: Requirements 5.1, 5.3**

- [ ]* 5.2 Write unit tests for ResultsSection component
  - Test MetaTagsColumn and PreviewCard render
  - Test split layout classes are applied
  - Test metadata is passed to child components
  - _Requirements: 5.1, 5.2_

- [x] 6. Implement main page component with state management
  - Update `src/app/links/page.tsx` to be a client component
  - Implement state management using useState for url, metadata, error, isLoading
  - Create handleUrlChange function to update url state
  - Create handleSubmit function to call API and update state
  - Implement API call to POST /api/links/metadata endpoint
  - Handle loading state during API call
  - Handle success response by updating metadata state
  - Handle error response by updating error state
  - Render HeroSection at top
  - Render LinkInputSection below hero
  - Conditionally render ResultsSection when metadata exists
  - _Requirements: 2.3, 2.4, 6.1_

- [ ]* 6.1 Write property test for loading state exclusivity
  - **Property 2: Loading state exclusivity**
  - **Validates: Requirements 2.4**

- [ ]* 6.2 Write property test for input field state preservation
  - **Property 8: Input field state preservation**
  - **Validates: Requirements 2.2**

- [x] 7. Implement error handling and display
  - Create error message mapping function for API error codes
  - Map INVALID_URL to user-friendly message
  - Map UNREACHABLE to user-friendly message
  - Map TIMEOUT to user-friendly message
  - Map PARSE_ERROR to user-friendly message
  - Map UNKNOWN to user-friendly message
  - Display error messages using Alert component from ui directory
  - Clear error state when user modifies input
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 7.1 Write property test for error message mapping
  - **Property 4: Error message mapping**
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ]* 7.2 Write unit tests for error handling
  - Test each error code displays correct message
  - Test error clears when input changes
  - Test error displays in correct location
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 8. Add accessibility features
  - Add ARIA labels to input field, submit button, and results section
  - Implement aria-busy attribute on form during loading
  - Add aria-live region for error announcements
  - Ensure proper heading hierarchy (h1 for hero, h2 for sections)
  - Add visible focus indicators using Tailwind ring utilities
  - Test keyboard navigation flow (tab order)
  - Ensure all interactive elements are keyboard accessible
  - Add semantic HTML (main, section, article tags)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.1 Write property test for accessibility focus order
  - **Property 7: Accessibility focus order**
  - **Validates: Requirements 7.2**

- [ ]* 8.2 Write accessibility tests
  - Test ARIA labels are present and correct
  - Test keyboard navigation works
  - Test focus indicators are visible
  - Test semantic HTML structure
  - Use axe-core for automated accessibility testing
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 9. Implement responsive design and styling
  - Apply responsive typography using Tailwind (text-3xl md:text-5xl pattern)
  - Implement responsive padding (p-6 md:p-12 pattern)
  - Test layout at mobile breakpoint (< 768px)
  - Test layout at tablet breakpoint (768px - 1024px)
  - Test layout at desktop breakpoint (> 1024px)
  - Ensure touch targets are at least 44x44px on mobile
  - Add smooth transitions for hover effects
  - Implement loading animations for better UX
  - _Requirements: 7.1, 7.5, 5.3, 5.4_

- [ ]* 9.1 Write integration tests for responsive behavior
  - Test mobile layout stacks components vertically
  - Test desktop layout displays side-by-side
  - Test breakpoint transitions work correctly
  - _Requirements: 5.1, 5.3, 7.1_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Polish and optimize
  - Add fade-in animation for ResultsSection using CSS transitions
  - Optimize image loading with Next.js Image component
  - Add loading skeleton for preview card image
  - Ensure color contrast meets WCAG AA standards
  - Test with screen reader (VoiceOver or NVDA)
  - Verify all components use design system tokens consistently
  - Add comments and documentation to complex logic
  - _Requirements: 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 11.1 Write integration test for full user flow
  - Test complete flow: enter URL → submit → view results
  - Mock API responses using MSW
  - Test both success and error scenarios
  - Verify state updates correctly throughout flow
  - _Requirements: 2.3, 3.1, 4.1, 6.1_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
