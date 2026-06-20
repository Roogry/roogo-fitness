import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardTooltipImports } from '@/shared/components/zard/tooltip';
import { LoggedSession } from '@/shared/models';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { TimeAgoPipe } from '@/shared/pipes/time-ago-pipe';
import { provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideArrowRight } from '@ng-icons/lucide';

/**
 * A card component displaying a previously logged workout session summary on the home page.
 *
 * @example
 * <app-home-logged-workout-card [session]="mySession"></app-home-logged-workout-card>
 */
@Component({
  selector: 'app-home-logged-workout-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZardBadgeComponent,
    ZardCardComponent,
    ZardTooltipImports,
    DurationFormatPipe,
    TimeAgoPipe,
    ZardBadgeComponent,
  ],
  providers: [provideIcons({ lucideActivity, lucideArrowRight })],
  templateUrl: './home-logged-workout-card.html',
})
export class HomeLoggedWorkoutCardComponent {
  session = input.required<LoggedSession>();
}
