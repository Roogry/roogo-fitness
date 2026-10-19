import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeftRight, lucideTrash2 } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';

/** Replace and Delete for the lifted exercise card. The service owns when this closes. */
@Component({
  selector: 'app-exercise-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent],
  providers: [provideIcons({ lucideArrowLeftRight, lucideTrash2 })],
  template: `
    <div
      class="flex w-50 flex-col items-start rounded-3xl border border-border bg-popover p-1"
      data-testid="exercise-context-menu"
      role="menu"
    >
      <button
        type="button"
        z-button
        zType="ghost"
        zShape="circle"
        class="w-full justify-start"
        role="menuitem"
        data-testid="exercise-context-replace"
        (click)="replaceClick.emit()"
      >
        <ng-icon name="lucideArrowLeftRight" class="size-4"></ng-icon>
        <span>Replace</span>
      </button>
      <button
        type="button"
        z-button
        zType="ghost"
        zShape="circle"
        class="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        role="menuitem"
        data-testid="exercise-context-delete"
        (click)="deleteClick.emit()"
      >
        <ng-icon name="lucideTrash2" class="size-4"></ng-icon>
        <span>Delete</span>
      </button>
    </div>
  `,
})
export class ExerciseContextMenu {
  readonly replaceClick = output<void>();
  readonly deleteClick = output<void>();
}
