# GREIA Component Library Documentation

This document provides an overview and usage guide for the GREIA platform's shared component library.

## Table of Contents

1. [Loading States](#loading-states)
2. [Dark Mode](#dark-mode)
3. [Shared Components](#shared-components)
4. [Page Transitions](#page-transitions)
5. [Error Handling](#error-handling)

## Loading States

The platform includes comprehensive loading states and animations for all major components.

### Skeleton Loading

```tsx
import { CardSkeleton, GridSkeleton, FormSkeleton } from '@/components/ui/loading-states'

// Single card loading
<CardSkeleton />

// Grid of loading cards
<GridSkeleton count={6} />

// Form loading
<FormSkeleton />
```

### Loading Indicators

```tsx
import { Spinner, ButtonLoading } from '@/components/ui/loading-states'

// Spinner with custom size and color
<Spinner size={40} color="#0066CC" />

// Loading button
<ButtonLoading loading>Processing...</ButtonLoading>
```

## Dark Mode

The platform supports system-preferred, light, and dark themes.

### Theme Provider

```tsx
import { ThemeProvider } from '@/providers/theme-provider'

// Wrap your app with the theme provider
<ThemeProvider>
  <App />
</ThemeProvider>
```

### Theme Toggle

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Add theme toggle to navigation
<ThemeToggle />
```

## Shared Components

### Card Component

```tsx
import { Card } from '@/components/ui/card'

<Card
  image="/path/to/image.jpg"
  title="Card Title"
  subtitle="Subtitle"
  description="Description text"
  price={{
    amount: 1000,
    currency: '£',
    unit: 'month'
  }}
  badges={{
    verified: true,
    featured: true
  }}
  stats={[
    { icon: Bed, label: 'Beds', value: 3 },
    { icon: Bath, label: 'Baths', value: 2 }
  ]}
  actions={[
    { label: 'View Details', href: '/details', primary: true },
    { label: 'Contact', onClick: () => {}, icon: MessageSquare }
  ]}
/>
```

### Hero Component

```tsx
import { Hero, PropertyHero } from '@/components/ui/hero'

// Generic hero
<Hero
  title="Welcome to GREIA"
  subtitle="Your lifestyle operating system"
  image="/path/to/image.jpg"
  search={{
    enabled: true,
    placeholder: "Search..."
  }}
/>

// Section-specific hero
<PropertyHero
  title="Find Your Perfect Property"
  subtitle="Browse through thousands of verified properties"
/>
```

### Filter Component

```tsx
import { Filters } from '@/components/ui/filters'

<Filters
  groups={[
    {
      id: 'type',
      name: 'Property Type',
      type: 'button',
      options: [
        { id: 'all', name: 'All', icon: Home },
        { id: 'residential', name: 'Residential', icon: House }
      ]
    },
    {
      id: 'price',
      name: 'Price Range',
      type: 'select',
      options: [
        { id: 'all', name: 'Any Price' },
        { id: '0-100000', name: 'Up to £100,000' }
      ]
    }
  ]}
  selectedFilters={filters}
  onFilterChange={(groupId, value) => {}}
/>
```

### Form Component

```tsx
import { Form } from '@/components/ui/form'

<Form
  fields={[
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validation: {
        required: 'Email is required'
      }
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea'
    }
  ]}
  onSubmit={async (data) => {}}
  schema={zodSchema}
/>
```

### Modal Component

```tsx
import { Modal, ConfirmModal } from '@/components/ui/modal'

// Basic modal
<Modal
  trigger={<Button>Open Modal</Button>}
  title="Modal Title"
  description="Modal description"
>
  Modal content
</Modal>

// Confirmation modal
<ConfirmModal
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  onConfirm={() => {}}
  danger
/>
```

## Page Transitions

### Basic Transitions

```tsx
import { PageTransition } from '@/components/ui/page-transition'

<PageTransition mode="fade">
  {children}
</PageTransition>
```

### Animation Components

```tsx
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  Stagger
} from '@/components/ui/page-transition'

// Fade in with delay
<FadeIn delay={0.2}>Content</FadeIn>

// Slide in from direction
<SlideIn direction="right">Content</SlideIn>

// Scale in
<ScaleIn>Content</ScaleIn>

// Staggered children
<Stagger>
  <div>Item 1</div>
  <div>Item 2</div>
</Stagger>
```

## Error Handling

### Error Boundary

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary'

<ErrorBoundary>
  {children}
</ErrorBoundary>
```

### Error Components

```tsx
import {
  ApiError,
  FormError,
  NotFound,
  NetworkError,
  LoadingError
} from '@/components/ui/error-boundary'

// API error
<ApiError
  status={404}
  message="Resource not found"
  retry={() => {}}
/>

// Form error
<FormError error="Invalid input" />

// 404 page
<NotFound
  title="Page Not Found"
  message="The page you are looking for does not exist"
/>

// Network error
<NetworkError retry={() => {}} />

// Loading error
<LoadingError
  message="Failed to load content"
  retry={() => {}}
/>
```

## Best Practices

1. **Consistency**: Use the shared components to maintain consistent styling and behavior across the platform.

2. **Dark Mode**: Always test components in both light and dark modes.

3. **Loading States**: Implement appropriate loading states to improve user experience during data fetching.

4. **Error Handling**: Use error boundaries and error components to gracefully handle failures.

5. **Accessibility**: All components are built with accessibility in mind - maintain this when creating new components.

6. **Responsive Design**: Components are mobile-first - ensure proper testing across all screen sizes.

7. **Performance**: Use loading states and transitions judiciously to maintain good performance.

## Contributing

When adding new components:

1. Follow the existing component structure
2. Include TypeScript types
3. Add loading states
4. Support dark mode
5. Include proper documentation
6. Test across all breakpoints
7. Ensure accessibility compliance

## Support

For questions or issues:
- Check the existing documentation
- Review component props and types
- Submit an issue with detailed reproduction steps