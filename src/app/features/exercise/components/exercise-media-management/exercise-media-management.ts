import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ZardButtonComponent } from '@/shared/components/zard/button/button.component';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import {
  lucideVideo,
  lucideChevronUp,
  lucideChevronDown,
  lucideTrash2,
  lucidePlus,
} from '@ng-icons/lucide';
import { ExerciseMedia } from '@/shared/models/workout.model';

@Component({
  selector: 'app-exercise-media-management',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    ZardButtonComponent,
    ZardInputDirective,
  ],
  providers: [
    provideIcons({
      lucideVideo,
      lucideChevronUp,
      lucideChevronDown,
      lucideTrash2,
      lucidePlus,
    }),
  ],
  templateUrl: './exercise-media-management.html',
})
export class ExerciseMediaManagement {
  media = input.required<ExerciseMedia[]>();
  
  addMedia = output<string>();
  removeMedia = output<number>();
  moveMediaUp = output<number>();
  moveMediaDown = output<number>();

  newMediaUrl = signal('');

  onAdd() {
    const url = this.newMediaUrl().trim();
    if (!url) return;
    this.addMedia.emit(url);
    this.newMediaUrl.set('');
  }

  onRemove(index: number) {
    this.removeMedia.emit(index);
  }

  onMoveUp(index: number) {
    this.moveMediaUp.emit(index);
  }

  onMoveDown(index: number) {
    this.moveMediaDown.emit(index);
  }
}
