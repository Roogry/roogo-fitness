import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormField } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';
import { ZardButtonComponent } from '@/shared/components/zard/button/button.component';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import { lucideGripVertical, lucideTrash2, lucidePlus } from '@ng-icons/lucide';

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

  onAdd() {
    this.addInstruction.emit();
  }

  onRemove(index: number) {
    this.removeInstruction.emit(index);
  }

  onDrop(event: CdkDragDrop<string[]>) {
    this.dropInstruction.emit(event);
  }
}
