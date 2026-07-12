# Forms Guide

This document outlines the standard for creating and managing forms in the Roogo Fitness application.

## 1. Signal Forms (Recommended)

In modern Angular (v21+), **Signal Forms** are the exclusive standard for handling forms. They provide a reactive, type-safe, and model-driven way to manage form state using Angular Signals.

**CRITICAL RULE:** Do NOT import `FormControl`, `FormGroup`, `FormArray`, or `FormBuilder` from `@angular/forms`. Signal Forms replace these concepts entirely.

### Setup and Creating a Form

Import `form` and `FormField` from `@angular/forms/signals`. You start by defining a model signal (your source of truth) and then deriving the form from it.

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField, submit, required, minLength } from '@angular/forms/signals';

@Component({
  standalone: true,
  imports: [FormField],
  // ...
})
export class PlanFormComponent {
  // 1. Define your model with initial values (NEVER use null or undefined)
  protected readonly planModel = signal({
    name: '', 
    description: '',
  });

  // 2. Create the form and define validation rules in the schema
  protected readonly planForm = form(this.planModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Plan name is required' });
    minLength(schemaPath.name, 3, { message: 'Must be at least 3 characters' });
  });

  // 3. Submit handler
  onSubmit() {
    // submit() callback MUST be async
    submit(this.planForm, async () => {
      console.log('Submitted values:', this.planModel());
      // e.g. await this.workoutService.savePlan(this.planModel());
    });
  }
}
```

## 2. Binding to the Template

Use the `[formField]` directive to bind inputs to the structural form fields. 

**CRITICAL**: Do NOT use `[value]`, `name`, `[disabled]`, `min`, or `max` attributes on the input element when using `[formField]`. The directive handles binding these states automatically.

```html
<form (submit)="onSubmit(); $event.preventDefault()">
  <label>
    Plan Name
    <!-- Bind directly to the structural path -->
    <input [formField]="planForm.name" />
  </label>
  
  <!-- Access state by CALLING the field as a function -->
  @if (planForm.name().touched() && planForm.name().errors().length) {
    <span class="error">{{ planForm.name().errors()[0].message }}</span>
  }

  <!-- Disable button if the form is invalid -->
  <button [disabled]="planForm().invalid()">Save Plan</button>
</form>
```

## 3. FormField vs FieldState

It's crucial to understand the difference between the structure and the state:

- **FormField** (Structural): `planForm.name`. This is used in the template for binding `[formField]="planForm.name"`.
- **FieldState** (State/Signals): `planForm.name()`. You **must call** the field as a function to access its state signals like `.valid()`, `.invalid()`, `.touched()`, `.dirty()`, or `.errors()`.

```typescript
// WRONG: Trying to access state on the structure
const isValid = this.planForm.name.valid(); 

// CORRECT: Call it first to get the FieldState, then access the signal
const isValid = this.planForm.name().valid();
```

## 4. Updating Form Values

Signal Forms are model-driven. To update the values programmatically, you do not call `setValue()` or `patchValue()` on the form itself. Instead, you update the underlying **model signal**.

```typescript
resetForm() {
  // Update the model directly
  this.planModel.set({
    name: '',
    description: ''
  });
  
  // You can also reset interaction states (touched/dirty)
  this.planForm().reset();
}
```
