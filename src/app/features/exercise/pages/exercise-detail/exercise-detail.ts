import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { JourneyService } from '@/core/services/journey.service';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePencil } from '@ng-icons/lucide';
import { Exercise } from '@/shared/models/workout.model';
import { ExerciseOverview } from '../exercise-overview/exercise-overview';
import { ExerciseJourney } from '../exercise-journey/exercise-journey';
import { pillVariants } from './exercise-detail.variants';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    ZardButtonComponent,
    HeaderComponent,
    NgIcon,
    ExerciseOverview,
    ExerciseJourney,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucidePencil,
    }),
  ],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.css',
})
export class ExerciseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private journeyService = inject(JourneyService);

  exercise = signal<Exercise | undefined>(undefined);
  isLoading = signal<boolean>(true);

  // Tab state
  activeTab = signal<'overview' | 'journey'>('overview');

  // Journey data
  highestWeight = signal<number>(0);
  totalSets = signal<number>(0);
  recentSessions = signal<any[]>([]);

  // Pills variant style generator
  getPillClass(tab: 'overview' | 'journey') {
    return pillVariants({ active: this.activeTab() === tab });
  }

  setTab(tabName: 'overview' | 'journey') {
    this.activeTab.set(tabName);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isLoading.set(true);
        const id = parseInt(idParam, 10);
        try {
          const detail = await this.workoutService.getExerciseById(id);
          this.exercise.set(detail);

          // Fetch journey stats
          if (detail) {
            const [pr, sets, sessions] = await Promise.all([
              this.journeyService.getHighestWeight(id),
              this.journeyService.getTotalSets(id),
              this.journeyService.getRecentSessions(id),
            ]);
            this.highestWeight.set(pr);
            this.totalSets.set(sets);
            this.recentSessions.set(sessions);
          }
        } catch (error) {
          console.error('Failed to load exercise', error);
        } finally {
          this.isLoading.set(false);
        }
      } else {
        this.isLoading.set(false);
      }
    });
  }
}
