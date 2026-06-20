import {
  Directive,
  type EmbeddedViewRef,
  inject,
  input,
  type OnDestroy,
  TemplateRef,
  ViewContainerRef,
  effect,
  type EffectRef,
} from '@angular/core';

/**
 * Type guard to check if a given value is an Angular TemplateRef.
 * @param value The value to check.
 * @returns True if the value is a TemplateRef, false otherwise.
 * @example
 * if (isTemplateRef(myValue)) { ... }
 */
export function isTemplateRef<C = unknown>(value: unknown): value is TemplateRef<C> {
  return value instanceof TemplateRef;
}

export interface ZardStringTemplateOutletContext {
  $implicit: unknown;
  [key: string]: unknown;
}

/**
 * A structural directive that safely renders either a string or an Angular TemplateRef.
 * Useful when a component property can accept either a static string or a custom template.
 * @example
 * <ng-container *zStringTemplateOutlet="myTemplateOrString; context: myContext"></ng-container>
 */
@Directive({
  selector: '[zStringTemplateOutlet]',
  exportAs: 'zStringTemplateOutlet',
})
export class ZardStringTemplateOutletDirective<T = unknown> implements OnDestroy {
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<void>);

  private embeddedViewRef: EmbeddedViewRef<ZardStringTemplateOutletContext> | null = null;
  private readonly context = {} as ZardStringTemplateOutletContext;

  #isFirstChange = true;
  #lastOutletWasTemplate = false;
  #lastTemplateRef: TemplateRef<void> | null = null;
  #lastContext?: ZardStringTemplateOutletContext;

  readonly zStringTemplateOutletContext = input<ZardStringTemplateOutletContext | undefined>(undefined);
  readonly zStringTemplateOutlet = input.required<T | TemplateRef<void>>();

  #hasContextShapeChanged(context: ZardStringTemplateOutletContext | undefined): boolean {
    if (!context) {
      return false;
    }
    const prevCtxKeys = Object.keys(this.#lastContext || {});
    const currCtxKeys = Object.keys(context || {});

    if (prevCtxKeys.length === currCtxKeys.length) {
      for (const propName of currCtxKeys) {
        if (!prevCtxKeys.includes(propName)) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  #shouldViewBeRecreated(
    stringTemplateOutlet: TemplateRef<void> | T,
    stringTemplateOutletContext: ZardStringTemplateOutletContext | undefined,
  ): boolean {
    const isTemplate = isTemplateRef(stringTemplateOutlet);

    const shouldOutletRecreate =
      this.#isFirstChange ||
      isTemplate !== this.#lastOutletWasTemplate ||
      (isTemplate && stringTemplateOutlet !== this.#lastTemplateRef);

    const shouldContextRecreate = this.#hasContextShapeChanged(stringTemplateOutletContext);
    return shouldContextRecreate || shouldOutletRecreate;
  }

  #updateTrackingState(
    stringTemplateOutlet: TemplateRef<void> | T,
    stringTemplateOutletContext: ZardStringTemplateOutletContext | undefined,
  ): void {
    const isTemplate = isTemplateRef(stringTemplateOutlet);
    if (this.#isFirstChange && !isTemplate) {
      this.#isFirstChange = false;
    }

    if (stringTemplateOutletContext !== undefined) {
      this.#lastContext = stringTemplateOutletContext;
    }

    this.#lastOutletWasTemplate = isTemplate;
    this.#lastTemplateRef = isTemplate ? stringTemplateOutlet : null;
  }

  readonly #viewEffect: EffectRef = effect(() => {
    const stringTemplateOutlet = this.zStringTemplateOutlet();
    const stringTemplateOutletContext = this.zStringTemplateOutletContext();

    if (!this.#isFirstChange && isTemplateRef(stringTemplateOutlet)) {
      this.#isFirstChange = true;
    }

    if (!isTemplateRef(stringTemplateOutlet)) {
      this.context['$implicit'] = stringTemplateOutlet as T;
    }

    const recreateView = this.#shouldViewBeRecreated(stringTemplateOutlet, stringTemplateOutletContext);
    this.#updateTrackingState(stringTemplateOutlet, stringTemplateOutletContext);

    if (recreateView) {
      this.#recreateView(
        stringTemplateOutlet as TemplateRef<ZardStringTemplateOutletContext>,
        stringTemplateOutletContext,
      );
    } else {
      this.#updateContext(stringTemplateOutlet, stringTemplateOutletContext);
    }
  });

  #recreateView(
    outlet: TemplateRef<ZardStringTemplateOutletContext>,
    context: ZardStringTemplateOutletContext | undefined,
  ): void {
    this.viewContainer.clear();
    if (isTemplateRef(outlet)) {
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(outlet, context);
    } else {
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
    }
  }

  #updateContext(outlet: TemplateRef<void> | T, context: ZardStringTemplateOutletContext | undefined): void {
    const newCtx = isTemplateRef(outlet) ? context : this.context;
    let oldCtx = this.embeddedViewRef?.context;

    if (!oldCtx) {
      oldCtx = newCtx;
    } else if (newCtx && typeof newCtx === 'object') {
      for (const propName of Object.keys(newCtx)) {
        oldCtx[propName] = newCtx[propName];
      }
    }
    this.#lastContext = oldCtx;
  }

  /**
   * Static context guard for Angular's strict template type checking.
   * @param _dir The directive instance.
   * @param _ctx The context to check.
   * @returns True, indicating the context is of type ZardStringTemplateOutletContext.
   * @example
   * ZardStringTemplateOutletDirective.ngTemplateContextGuard(dir, ctx);
   */
  static ngTemplateContextGuard<T>(
    _dir: ZardStringTemplateOutletDirective<T>,
    _ctx: unknown,
  ): _ctx is ZardStringTemplateOutletContext {
    return true;
  }

  ngOnDestroy(): void {
    this.#viewEffect.destroy();
    this.viewContainer.clear();
    this.embeddedViewRef = null;
  }
}
