# AGENTS.md

Agent context for **Roogo Fitness** (`roogo-fitness`): an Angular 21 PWA with no backend. Workout data lives in IndexedDB. The device that matters is an iPhone running as an iOS Safari PWA.

Deeper notes live in `docs/`. Follow this file when they disagree.

## Before you start

- [ ] Search `src/app/shared/components` and `src/app/shared/components/zard` before adding UI.
- [ ] Search `src/app/shared/pipes`, `src/app/shared/utils`, `src/app/shared/directives`, and `src/app/core/services` before adding helpers.
- [ ] Match the folder you are in: kebab-case files, `app` prefix, signal inputs.
- [ ] If the request is unusual, weak for UX or performance, or fights iOS conventions, stop and offer 2–3 options. Then follow the owner's choice.
- [ ] Add or extend a vitest spec for behavior changes.
- [ ] `ng test` and `ng build` pass before you push.

## Stack

- Angular **21.2.1** (`@angular/core`, CLI, CDK). Builder `@angular/build`. No `zone.js` — the app is zoneless.
- Tailwind CSS **4.1.12** via `@tailwindcss/postcss` and `tailwindcss-animate`. Tokens live in `src/styles.css`.
- TypeScript **~6.0.3**. Vitest **4.0.8** through `ng test` (`@angular/build:unit-test`, `vitest/globals`).
- Package manager **pnpm**. Scripts: `pnpm start` (`ng serve`), `pnpm test`, `pnpm build`.
- PWA: `@angular/service-worker`, `manifest.webmanifest`, production `ngsw-config.json`.
- Path alias `@/*` → `src/app/*` (example: `@/core/services/workout.service`).

## Layout

```text
src/app/
  core/services/       DbService, WorkoutService, ExerciseService, MuscleService,
                       PlanService, VisualViewportService
  core/provider/       provideZard()
  features/<feature>/  home, plan, exercise, journey, profile, session-active
    pages/             route screens
    components/        feature UI
  shared/components/   header, sheet, nav-pills, bottom-nav, main-layout,
                       circle-muscle-card, floating-blur, zard/
  shared/pipes/        timeFormat, durationFormat, timeAgo
  shared/models/       Exercise, WorkoutPlan, LoggedSession
  shared/directives/   appDismissKeyboardOnScroll, zStringTemplateOutlet, zardId
  shared/utils/        mergeClasses, format, number, file
```

`JourneyService` stays under `features/journey/services`. Do not import `core` from `shared`.

## Angular 21

New code is standalone (the default). Do not add `NgModule`s. Omit `standalone: true` on new components; many existing files still set it. Leave that alone unless you are already editing the file.

- State: `signal`, `computed`, `effect`. Use `linkedSignal` when writable state must reset from a source (`exercise-list` filters, `z-input` size, calendar month).
- API: `input()`, `output()`, `model()`. `inject()` for DI. `viewChild()` / `viewChildren()`. `afterNextRender` for DOM that is not ready yet (`z-button` icon check, session page).
- Templates: `@if`, `@for` with `track`, `@switch`. Host bindings go in the `host` object, not `@HostBinding`.
- Motion: `animate.enter` / `animate.leave` (`z-dialog` uses `dialog-enter`; the keyboard helper uses `helper-chip-in` and `helper-leave`).
- Change detection is zoneless. `zard/*` and `app-header` set `ChangeDetectionStrategy.OnPush`. Set OnPush on new shared UI. Signals are what trigger updates.

```html
<button z-button zType="lime" zSize="default" zShape="circle" (click)="onSaveClick()">
  Save
</button>

@for (set of sets(); track set.id) {
  <span class="font-mono">{{ set.reps_completed }}</span>
}
```

```typescript
readonly title = input('');
readonly saveClick = output<void>();
private readonly workout = inject(WorkoutService);
readonly volume = computed(() => this.workout.totalVolume());
```

Do not add `*ngIf` / `*ngFor`, `@Input()` / `@Output()`, constructor DI, or `NgModule`s.

Do not copy these legacy spots:

- `ZardDialogRef` uses constructor injection and `@Inject(PLATFORM_ID)`, and its generics are `any`.
- `Z_MODAL_DATA` is `InjectionToken<any>`. `DbService` types the database as `IDBPDatabase<any>`. `WorkoutService.durationInterval` is `any`. `HeaderComponent.backLink` is `any[] | null`.
- `ngClass` remains in `home.html`, `plan-card.html`, and `header.html`. Prefer `[class]` bindings.
- The pipe class `timeFormatPipe` is camelCase. New pipes are PascalCase, like `DurationFormatPipe`.
- Keyboard helper chips use raw `<button>`s and the hex `#BEF264`. Actions use `z-button` and tokens (`bg-lime`, `text-ink`).

## Reuse before you create

Search first. Use the existing piece. Add an `input()` if it is one variant short. Do not hand-roll a Tailwind `<button>` when `z-button` covers it.

**zard** (`src/app/shared/components/zard`):

- `z-button` / `button[z-button]` / `a[z-button]` — `zType` (`default`, `lime`, `destructive`, `outline`, `dashed`, `secondary`, `ghost`, `link`), `zSize` (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`), `zShape` (`circle` default, `default`, `square`), `zFull`, `zLoading`, `zDisabled`. Default size is `h-12`.
- `z-badge` — `zType` (`default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`, `forest`), `zShape` (`default`, `square`, `pill`).
- `ZardDialogService.create()` and `z-dialog` for confirmations (discard session, plan delete).
- `z-card`, `z-checkbox`, `z-icon`, `input[z-input]` / `textarea[z-input]`, `z-select` / `z-select-item`.
- `z-form-field`, `z-form-label`, `z-form-control`, `z-form-message`.
- `z-calendar` (plus grid and navigation), `z-popover` / `[zPopover]`, `z-tooltip` / `[zTooltip]`.

**App chrome** (not under `zard/`):

- `app-header`, `app-sheet` (slide-up on mobile, centered from `md`; `title`, `description`, `isOpen`, output `onOpenChange`).
- `app-nav-pills` + `button[app-nav-pills-item]`, `app-bottom-nav`, `app-main-layout`, `app-circle-muscle-card`.
- `app-floating-blur` — gradient fade. Input `extendBottom` (a CSS length, usually negative).
- `app-keyboard-helper-bar` lives in `features/exercise/components/keyboard-helper-bar`. It is presentational: inputs `mode` (`'weight' | 'reps'`), `chips`, `current`, `bottom`, `top`; output `picked`. Weight steps are `-10`, `-5`, `+5`, `+10`. Pure helpers: `adjustWeight`, `repsChips`.
- `app-rest-timer-bar` lives in `features/session-active/components/rest-timer-bar`.

**Pipes:** `timeFormat`, `durationFormat`, `timeAgo`. Clock times use the `date` pipe with `'HH:mm'` (24-hour), as on the session bar.

**Directive:** `[appDismissKeyboardOnScroll]` blurs the focused field after a vertical touch drag past 10px. It ignores drags that start on the helper bar and mostly horizontal drags.

## Rule of three

If the same markup or logic shows up a third time, or twice and the reuse is obvious, extract it.

- Presentational component: `input()` in, `output()` out, no service injection.
- Or a pure function in `shared/utils` (or next to the component, like `adjustWeight`).

Real cases:

- `app-floating-blur` wraps three floating surfaces: the session bar (`extendBottom="-2rem"`), the home widget in `app-main-layout` (`-1.25rem`), and the keyboard helper (`-100lvh`).
- `app-rest-timer-bar` is the rest row on the session page and on `app-active-session-widget`. Clicks call `stopPropagation` so the widget's navigate click does not fire. It injects `WorkoutService` because both hosts already share that singleton. New extractions stay dumb unless one service truly owns the state.

## Challenge the owner

If a request looks uncommon, ineffective, bad for performance or UX, or against iOS conventions, say so before implementing. Offer 2–3 alternatives with pros, cons, and a recommendation. Do not silently comply, and do not refuse. Implement the option the owner picks.

Past calls:

- Auto-closing the keyboard after a 200px page scroll fights typing and fights iOS, which already scrolls the page while a field is focused. What landed: a 10px vertical touch-drag dismiss (`appDismissKeyboardOnScroll`), and hiding the session bar while `VisualViewportService.keyboardOpen()` is true. Offer those, or leaving the keyboard alone, before adding another scroll listener.
- A heavy `backdrop-filter` on floating chrome stutters iOS Safari while scrolling. What landed: `app-floating-blur`, a gradient into `var(--background)`. Prefer that over another blur.

## UI

Mobile first. iPhone / iOS Safari, installed as a PWA, is the target. `index.html` locks the viewport (`maximum-scale=1`, `user-scalable=no`).

Use tokens from `src/styles.css` (`@theme inline` maps them to Tailwind):

- Canvas `--background` (`#f7f8f2`) → `bg-background`. Ink `--ink` / `--foreground` (`#0D2519`). Forest `--forest` (`#0F3B29`) → `bg-forest`. Lime `--lime` (`#caf85a`, also `--primary`) → `text-lime` / `bg-primary`.
- Mist `--secondary` (`#eef1e6`), card `--card`, hairline `--border`, muted text `--muted-foreground`, error `--destructive`.
- Display: Bricolage Grotesque (`font-display` on headings). Body: Inter. Numbers: JetBrains Mono (`font-mono`).

- Chips size to their label (`shrink-0`, `min-w-14`, `rounded-full`), like the helper chips. Do not stretch them with `w-full`. Full-width actions are `z-button` with `zFull` (Start Session, Add set).
- Shell radius: `rounded-full` for pills, the widget at rest, and icon buttons. `rounded-4xl` for the session bar and for the widget while rest is showing.
- Floating bottom UI uses `app-floating-blur` (gradient fade, `pointer-events-none` on the fade layers). Do not add `backdrop-blur` or `backdrop-filter`. Leftovers to avoid copying: `backdrop-blur-md` on the forest session card and widget, `backdrop-blur-sm` on the sheet scrim, `backdrop-blur` on exercise-media controls.
- Respect `prefers-reduced-motion`. The helper bar uses `motion-reduce:` and a `prefers-reduced-motion` block. Match that. Keep motion short: helper chips enter in 160ms ease-out, leave in 120ms; the session bar uses `duration-200 ease-out`.
- Touch targets about 40px or taller. Prefer `zSize` `default` (`h-12`) or `sm` (`h-10`). Helper chips are `h-10`. Do not copy `xs` or the `w-9 h-9` controls in `exercise-tracker` for a primary action.
- Keep focus. Helper chips use `pointerdown` + `preventDefault` (and `mousedown` `preventDefault`) so the field does not blur. `exercise-tracker` `preventDefault`s Enter on weight so focus moves to reps.
- Pin keyboard UI with `VisualViewportService` (`keyboardOffset`, `visualBottom`, `keyboardOpen`). Times are 24-hour `HH:mm`.

## Data

No HTTP API. `DbService` opens IndexedDB `RoogoFitnessDB` through `idb` (plans, logged sessions, exercises, muscles) and seeds mocks when a store is empty.

`WorkoutService` owns the active session and persists it to `localStorage` key `roogo_active_session`. Timers are timestamps, not countdown numbers stored in components:

- `sessionStartTime` — epoch ms when the session started. Duration is derived from `Date.now()`.
- `restEndsAt` — epoch ms when rest ends. `restRemainingSeconds` is derived. A rest that has already expired is dropped on restore.

Do not keep a ticking "seconds left" only inside a component. Start, add, and skip rest through `WorkoutService`.

## Quality

- Specs sit next to the code (`*.spec.ts`) and use Vitest (`describe`, `it`, `expect`, `vi`). Extend the nearest spec (`workout.service.spec.ts`, `keyboard-helper-bar.spec.ts`, `session-active.spec.ts`, and so on).
- `ng test` and `ng build` must pass before pushing.
- Strict TypeScript is on. No new `any`. Use a real type or `unknown`.
- JSDoc on public service methods, matching `WorkoutService`: summary, `@param`, `@returns`, `@example`.
- Keep components small. Logic goes in a service or a pure function. Pages coordinate; they do not reimplement timers, the keyboard, or IndexedDB.

## Git

- Branch: `<type>/<issue#>-<short-kebab>` with `feat`, `fix`, `docs`, `refactor`, or `chore`. Example: `feat/75-keyboard-helper-bar`. Never `cursor/`.
- Commits: `feat(#75): keyboard helper chips for weight and reps`.
- One PR per issue. Body includes `Closes #N`.
- Review the change, then propose or apply it. When the owner asks to preview on a device, wait for that before committing.
- Keep the branch updated with `master`. If another open PR touches the same files, say so and name a merge order.
