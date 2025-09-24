# Global Navigation System Documentation

This document explains the comprehensive navigation system implemented in the application, which provides consistent, logical navigation between pages with history management, breadcrumbs, and keyboard shortcuts.

## Overview

The navigation system consists of several key components:

1. **Navigation Configuration** (`src/config/navigation.ts`) - Defines the page hierarchy and metadata
2. **Navigation Context** (`src/context/NavigationContext.tsx`) - Provides global navigation state and methods
3. **Navigation Components** - UI components for navigation controls
4. **Page Layout** (`src/components/layout/PageLayout.tsx`) - Standardized page wrapper with navigation

## Key Features

### ✅ Intelligent Breadcrumbs
- Automatically generated based on page hierarchy
- Clickable navigation through parent pages
- Semantic labels for better UX

### ✅ History Management
- Tracks user navigation history (last 50 pages)
- Browser-style back/forward functionality
- Scroll position restoration
- Handles browser back/forward buttons

### ✅ Keyboard Shortcuts
- `Alt + ←` : Go Back
- `Alt + →` : Go Forward  
- `Alt + ↑` : Go to Parent Page
- `Alt + H` : Go to Home

### ✅ Page-to-Page Navigation
- Next/Previous within same category
- Logical flow between related pages
- Smart routing based on page relationships

### ✅ Consistent Page Structure
- Standardized headers with navigation controls
- Unified breadcrumb styling
- Responsive design patterns

## Adding New Pages

### Step 1: Define Page in Navigation Config

Add your page to `src/config/navigation.ts`:

```typescript
'/your-new-page': {
  path: '/your-new-page',
  title: 'Your Page Title',
  description: 'Brief description of what this page does',
  parent: '/parent-page-path', // Optional: if this is a child page
  category: 'your-category', // Groups related pages together
  breadcrumbLabel: 'Short Label', // Optional: shorter label for breadcrumbs
  showInSidebar: true, // Whether to show in sidebar navigation
},
```

### Step 2: Add Route to App.tsx

Add the route definition:

```typescript
<Route path="/your-new-page" element={<YourNewPage />} />
```

### Step 3: Create Page Component

Use the `PageLayout` component for consistent structure:

```typescript
import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/layout/PageLayout';

const YourNewPage: React.FC = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Page Title | App Name</title>
        <meta name="description" content="Page description for SEO" />
        <link rel="canonical" href="/your-new-page" />
      </Helmet>

      {/* Your page content here */}
      <div>
        <p>Your page content...</p>
      </div>
    </PageLayout>
  );
};

export default YourNewPage;
```

### Step 4: Update Sidebar (if needed)

If the page should appear in the sidebar, add it to `src/components/layout/AppSidebar.tsx` in the appropriate section.

## Page Layout Options

The `PageLayout` component accepts several props for customization:

```typescript
<PageLayout
  title="Custom Title"                    // Override navigation title
  description="Custom description"        // Override navigation description
  actions={<Button>Action</Button>}      // Add action buttons to header
  showNavigation={false}                 // Hide navigation controls
  showBreadcrumbs={false}               // Hide breadcrumbs
  showPageNavigation={false}            // Hide prev/next page navigation
  className="custom-class"              // Add custom CSS classes
  containerClassName="container-class"  // Customize container styling
>
  {/* Your content */}
</PageLayout>
```

## Navigation Context API

Access navigation functionality in any component:

```typescript
import { useNavigation } from '@/context/NavigationContext';

const YourComponent = () => {
  const {
    currentPage,      // Current page metadata
    parentPage,       // Parent page metadata (if any)
    breadcrumbs,      // Array of breadcrumb pages
    history,          // Navigation history
    canGoBack,        // Boolean: can navigate back
    canGoForward,     // Boolean: can navigate forward
    goBack,           // Function: go to previous page in history
    goForward,        // Function: go to next page in history
    goToParent,       // Function: go to parent page
    goToNext,         // Function: go to next page in category
    goToPrevious,     // Function: go to previous page in category
    navigateWithHistory, // Function: navigate to path with history tracking
    clearHistory      // Function: clear navigation history
  } = useNavigation();

  // Use navigation methods...
};
```

## Navigation Components

### NavigationControls

Basic navigation buttons (back, forward, up, home):

```typescript
import { NavigationControls } from '@/components/layout/NavigationControls';

<NavigationControls 
  variant="compact"    // 'default' | 'compact'
  showLabels={false}   // Show text labels on buttons
  className="my-class" // Custom styling
/>
```

### PageNavigation

Previous/Next page navigation within categories:

```typescript
import { PageNavigation } from '@/components/layout/NavigationControls';

<PageNavigation 
  showLabels={true}    // Show "Previous"/"Next" labels
  className="my-class" // Custom styling
/>
```

## Best Practices

### Page Hierarchy
- Keep hierarchy logical and shallow (max 3-4 levels)
- Use descriptive category names
- Group related functionality together

### Breadcrumb Labels
- Keep breadcrumb labels short (1-2 words)
- Use action-oriented language when appropriate
- Maintain consistency within categories

### Page Titles
- Use descriptive, unique titles
- Include context when necessary
- Follow consistent naming patterns

### Categories
- Use consistent category names across related pages
- Align categories with sidebar organization
- Consider user mental models and workflows

## Troubleshooting

### Page Not Showing in Breadcrumbs
- Check that the page is defined in `navigation.ts`
- Verify the path matches exactly (including trailing slashes)
- Ensure parent relationships are correct

### Navigation History Issues
- History is automatically managed
- Clear history with `clearHistory()` if needed
- Check console for navigation errors

### Keyboard Shortcuts Not Working
- Ensure the page is focused (click on page content)
- Check for conflicting browser shortcuts
- Verify the navigation context is properly wrapped

## Examples

### Simple Page
```typescript
// In navigation.ts
'/simple-page': {
  path: '/simple-page',
  title: 'Simple Page',
  category: 'general',
  showInSidebar: true,
},

// Component
const SimplePage = () => (
  <PageLayout>
    <p>Simple page content</p>
  </PageLayout>
);
```

### Child Page with Parent
```typescript
// In navigation.ts
'/settings/advanced': {
  path: '/settings/advanced',
  title: 'Advanced Settings',
  parent: '/settings',
  category: 'settings',
  breadcrumbLabel: 'Advanced',
  showInSidebar: false,
},

// Component automatically gets breadcrumbs: Home > Settings > Advanced
const AdvancedSettings = () => (
  <PageLayout>
    <p>Advanced settings content</p>
  </PageLayout>
);
```

### Page with Custom Actions
```typescript
const PageWithActions = () => {
  const actions = (
    <div className="flex gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </div>
  );

  return (
    <PageLayout actions={actions}>
      <p>Page content with action buttons</p>
    </PageLayout>
  );
};
```

This navigation system provides a solid foundation for consistent, user-friendly navigation throughout the application. It automatically handles complex navigation scenarios while remaining flexible for custom use cases.