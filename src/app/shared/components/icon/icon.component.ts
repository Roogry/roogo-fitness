import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import type { ClassValue } from 'clsx';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { mergeClasses } from '@/shared/utils/merge-classes';
import { iconVariants, type ZardIconSizeVariants } from './icon.variants';
import { ZARD_ICONS, ZARD_ICON_IMPORTS, type ZardIcon } from './icons';

@Component({
  selector: 'z-icon, [z-icon]',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons(ZARD_ICON_IMPORTS)],
  template: `
    <ng-icon
      [name]="iconName()"
      [strokeWidth]="zStrokeWidth()"
      [class]="classes()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZardIconComponent {
  readonly zType = input.required<ZardIcon>();
  readonly zSize = input<ZardIconSizeVariants>('default');
  readonly zStrokeWidth = input<number>(2);
  readonly zAbsoluteStrokeWidth = input<boolean>(false);
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() =>
    mergeClasses(iconVariants({ zSize: this.zSize() }), this.class(), this.zStrokeWidth() === 0 ? 'stroke-none' : ''),
  );

  protected readonly iconName = computed(() => {
    const type = this.zType();
    return ZARD_ICONS[type];
  });
}
