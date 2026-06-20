import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormField } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';
import { ZardButtonComponent } from '@/shared/components/zard/button/button.component';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import { lucideGripVertical, lucideTrash2, lucidePlus } from '@ng-icons/lucide';

/**
 * A component displaying a reorderable list of exercise instructions.
 *
 * @example
 * <app-exercise-instruction-list [instructions]="instructions" (addInstruction)="onAdd()"></app-exercise-instruction-list>
 */
@Component({
  selector: 'app-exercise-instruction-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    NgIcon,
    FormField,
    ZardFormImports,
    ZardButtonComponent,
    ZardInputDirective,
  ],
  providers: [
    provideIcons({
      lucideGripVertical,
      lucideTrash2,
      lucidePlus,
    }),
  ],
  templateUrl: './exercise-instruction-list.html',
  styleUrl: './exercise-instruction-list.css',
})
export class ExerciseInstructionList {
  instructions = input.required<any>();

  addInstruction = output<void>();
  removeInstruction = output<number>();
  dropInstruction = output<CdkDragDrop<string[]>>();

  /**
   * Emits an event to trigger adding a new instruction.
   *
   * @example
   * this.onAdd();
   */
  onAdd() {
    this.addInstruction.emit();
  }

  /**
   * Emits an event to remove an instruction at a specific index.
   *
   * @param {number} index - The index of the instruction to remove.
   *
   * @example
   * this.onRemove(1);
   */
  onRemove(index: number) {
    this.removeInstruction.emit(index);
  }

  /**
   * Handles drag and drop reordering of the instructions list.
   *
   * @param {CdkDragDrop<string[]>} event - The drag and drop event details.
   *
   * @example
   * this.onDrop(dropEvent);
   */
  onDrop(event: CdkDragDrop<string[]>) {
    this.dropInstruction.emit(event);
  }
}
