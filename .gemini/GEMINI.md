You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Signal Forms (@angular/forms/signals) instead of Template-driven or legacy Reactive forms
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Forms & UI (Zard UI + Signal Forms)

- **Strictly use `@angular/forms/signals`** (Signal Forms API) for any form-related implementations. Do NOT use `FormsModule` (`ngModel`) or `ReactiveFormsModule` (`FormBuilder`, `FormGroup`).
- Use the `form()` function to define a model-driven form and the `[formField]` directive to bind it to the template.
- **NEVER use `null` or `undefined`** as initial values in the form state (use `''` for text/numeric inputs, `0` only if strictly required and supported by the UI component, or `[]` for arrays).
- **Zard UI Integration**:
  - Always wrap form inputs with the Zard UI Form wrapper structure: `<z-form-field>`, `<label z-form-label>`, `<z-form-control>`, and `<z-form-message>`.
  - Pass error messages from the Signal Form directly to the Zard UI control: `<z-form-control [errorMessage]="form.myField().errors()[0]?.message ?? ''">`.
  - For numeric inputs using `<input z-input type="number">`, Zard UI's `[formField]` directive integration expects a `string` binding type. Define the form state field as a string (e.g., `weight: ''`), validate it using `parseFloat()`/`parseInt()`, and cast the value when submitting: `submit(form, async (f) => { parseFloat(f.weight().value()) })`.
