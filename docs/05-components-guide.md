# Components Guide

This guide details how to build Angular components in the Roogo Fitness project, adhering to Angular v21 standards.

## 1. Standalone Components

Every component in this project **must** be a Standalone Component. We do not use `NgModules`.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, SomeSharedComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
})
export class ExampleComponent {}
```

## 2. Reactivity with Signals

Angular Signals are the standard for managing component state.

### Using `signal()` and `computed()`
- Use `signal()` for mutable state.
- Use `computed()` for derived state.

```typescript
import { Component, signal, computed } from '@angular/core';

export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### Signal Inputs and Outputs
Replace traditional `@Input()` and `@Output()` decorators with the new signal-based functions.

- **Component Outputs**: Use `[Element] + [Event]` pattern (without `on` prefix).
- **Event Handlers**: Use `on + [Element] + [Event]` pattern for methods bound to template events.

```typescript
import { Component, input, output } from '@angular/core';

export class UserCardComponent {
  // Required input
  user = input.required<User>();
  
  // Optional input with default
  theme = input<'light' | 'dark'>('light');
  
  // Output: [Element] + [Event]
  deleteUserClick = output<string>();

  // Event handler method: on + [Element] + [Event]
  onDeleteButtonClick() {
    this.deleteUserClick.emit(this.user().id);
  }
}
```

## 3. Template Control Flow

Use the new built-in control flow syntax instead of structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).

### Conditional Rendering (`@if`)
```html
@if (user()) {
  <p>Hello, {{ user().name }}!</p>
} @else {
  <p>Please log in.</p>
}
```

### Iteration (`@for`)
Always include the `track` expression for performance.
```html
<ul>
  @for (session of recentSessions(); track session.id) {
    <li>{{ session.name }}</li>
  } @empty {
    <li>No sessions found.</li>
  }
</ul>
```

## 4. Styling with Tailwind CSS

We use Tailwind CSS v4.
- Avoid writing custom CSS in the component's `.css` file unless absolutely necessary for complex animations or pseudo-elements not easily handled by Tailwind.
- Use `clsx` and `tailwind-merge` for conditionally combining classes, especially in shared UI components.

```typescript
// Example of a computed class string if needed
import { computed } from '@angular/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
