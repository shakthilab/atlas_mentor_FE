# Loading Indicators System

A comprehensive loading indicator system inspired by UntitledUI design patterns for Angular applications.

## Overview

This loading system provides:
- **Multiple Loading Types**: Dot-circle, spinner, pulse, and dots animations
- **Flexible Sizes**: Extra small to extra large variants
- **Global Loading Management**: Centralized loading state service
- **Automatic API Loading**: HTTP interceptor for automatic loading indicators
- **Dark Mode Support**: Built-in dark theme compatibility

## Components

### 1. LoadingIndicatorComponent

A reusable loading indicator component with multiple types and sizes.

```typescript
import { LoadingIndicatorComponent } from "@/components/application/loading-indicator/loading-indicator";

export const DotCircleWithLabelDemo = () => {
    return <LoadingIndicator type="dot-circle" size="md" label="Loading..." />;
};
```

#### Properties

- `type`: `'dot-circle' | 'spinner' | 'pulse' | 'dots'` (default: `'dot-circle'`)
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `label`: `string` (optional)

#### Usage Examples

```html
<!-- Basic dot-circle loading -->
<app-loading-indicator type="dot-circle" size="md" label="Loading..."></app-loading-indicator>

<!-- Different types -->
<app-loading-indicator type="spinner" size="lg"></app-loading-indicator>
<app-loading-indicator type="pulse" size="sm"></app-loading-indicator>
<app-loading-indicator type="dots" size="xl" label="Processing..."></app-loading-indicator>
```

### 2. LoadingService

A global service for managing loading states across the application.

#### Methods

- `show(message?, type?, size?)`: Show loading indicator
- `hide()`: Hide loading indicator
- `withLoading(fn, message?, type?, size?)`: Execute function with automatic loading

#### Usage Examples

```typescript
import { LoadingService } from '@/core/services/loading.service';

constructor(private loadingService: LoadingService) {}

// Manual loading control
showLoading() {
  this.loadingService.show('Loading data...', 'dot-circle', 'md');
  
  setTimeout(() => {
    this.loadingService.hide();
  }, 2000);
}

// Automatic loading with async operations
async loadData() {
  try {
    const result = await this.loadingService.withLoading(
      () => this.apiService.getData(),
      'Fetching data...',
      'spinner',
      'lg'
    );
    console.log('Data loaded:', result);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}
```

### 3. GlobalLoadingComponent

A global overlay loading component that appears over the entire application.

#### Usage

The component is automatically added to `app.component.ts` and responds to the global `LoadingService` state.

```html
<app-global-loading></app-global-loading>
```

### 4. LoadingInterceptor

HTTP interceptor that automatically shows loading indicators for API calls.

#### Features

- Automatically shows loading for HTTP requests
- Skips loading for health checks and status endpoints
- Manages concurrent requests efficiently
- Configurable skip rules

#### Skip Loading for Specific Requests

```typescript
// Add header to skip loading
this.http.get('/api/health', { 
  headers: { 'X-Skip-Loading': 'true' } 
});
```

## Integration Guide

### 1. Basic Setup

The loading system is already integrated into the application:

1. **LoadingService** is provided at root level
2. **LoadingInterceptor** is registered in `app.config.ts`
3. **GlobalLoadingComponent** is added to `app.component.ts`

### 2. Updating Existing Components

Replace manual loading states with the new system:

#### Before (Old Way)
```typescript
isLoading = true;

this.service.getData().subscribe({
  next: (data) => {
    this.data = data;
    this.isLoading = false;
  },
  error: (err) => {
    this.isLoading = false;
  }
});
```

#### After (New Way)
```typescript
constructor(private loadingService: LoadingService) {}

async loadData() {
  try {
    const data = await this.loadingService.withLoading(
      () => this.service.getData().toPromise(),
      'Loading data...'
    );
    this.data = data;
  } catch (error) {
    // Error handling
  }
}
```

### 3. Template Updates

Replace loading templates:

#### Before
```html
<div *ngIf="isLoading" class="loading-spinner">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>
```

#### After
```html
<app-loading-indicator 
  *ngIf="isLoading" 
  type="dot-circle" 
  size="md" 
  label="Loading...">
</app-loading-indicator>
```

## Demo Component

A comprehensive demo component is available at `LoadingDemoComponent`:

```typescript
import { LoadingDemoComponent } from '@/shared/components/loading-demo';
```

Features:
- All loading types and sizes
- Interactive examples
- Global loading demonstrations
- API call simulations

## Styling

The components use modern CSS with:
- CSS animations for smooth transitions
- Responsive design
- Dark mode support
- UntitledUI-inspired design patterns

### Customization

You can customize the appearance by modifying the CSS files:
- `loading-indicator.component.css` - Individual indicator styles
- `global-loading.component.css` - Global overlay styles

## Best Practices

1. **Use Global Loading for Page Transitions**: When loading entire pages or major data sets
2. **Use Local Loading for Components**: When loading specific component data
3. **Provide Meaningful Messages**: Use descriptive loading messages
4. **Choose Appropriate Sizes**: Match loading size to context importance
5. **Handle Errors Gracefully**: Always include error handling with loading states

## API Reference

### LoadingIndicatorComponent

```typescript
interface LoadingIndicatorProps {
  type?: 'dot-circle' | 'spinner' | 'pulse' | 'dots';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
}
```

### LoadingService

```typescript
interface LoadingState {
  isLoading: boolean;
  message?: string;
  type?: LoadingIndicatorType;
  size?: LoadingIndicatorSize;
}

class LoadingService {
  show(message?: string, type?: LoadingIndicatorType, size?: LoadingIndicatorSize): void;
  hide(): void;
  withLoading<T>(fn: () => Promise<T> | Observable<T>, message?: string, type?: LoadingIndicatorType, size?: LoadingIndicatorSize): Promise<T>;
  readonly loading$: Observable<LoadingState>;
  readonly currentLoadingState: LoadingState;
}
```

## Troubleshooting

### Common Issues

1. **Loading Not Showing**: Ensure `LoadingService` is injected and component is imported
2. **Global Loading Not Working**: Check that `GlobalLoadingComponent` is in `app.component.ts`
3. **API Loading Not Working**: Verify `LoadingInterceptor` is registered in `app.config.ts`
4. **TypeScript Errors**: Ensure proper imports and type annotations

### Debug Tips

- Check browser console for loading service messages
- Verify HTTP interceptor is functioning in Network tab
- Test with demo component to validate basic functionality
