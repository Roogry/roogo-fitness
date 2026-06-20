import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { JourneyService } from '@/features/journey/services/journey.service';
import { ExerciseService } from '@/core/services/exercise.service';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePencil } from '@ng-icons/lucide';
import { Exercise } from '@/shared/models';
import { ExerciseOverview } from '../exercise-overview/exercise-overview';
import { ExerciseJourney } from '../exercise-journey/exercise-journey';
import { NavPillsComponent, NavPillsItemComponent } from '@/shared/components/nav-pills';

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
    NavPillsComponent,
    NavPillsItemComponent,
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
  private exerciseService = inject(ExerciseService);

  exercise = signal<Exercise | undefined>(undefined);
  recommendedExercises = signal<Exercise[]>([]);
  isLoading = signal<boolean>(true);

  // Tab state
  activeTab = signal<'overview' | 'journey'>('overview');

  // Journey data
  highestWeight = signal<number>(0);
  highestWeightReps = signal<number>(0);
  totalSets = signal<number>(0);
  lastLogged = signal<string | undefined>(undefined);
  recentSessions = signal<any[]>([]);

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

          // Fetch recommendations
          if (detail && detail.primary_muscle) {
            const recommendations = await this.exerciseService.getExercisesByMuscle(
              detail.primary_muscle.id,
            );
            this.recommendedExercises.set(recommendations.filter((e) => e.id !== detail.id));
          } else {
            this.recommendedExercises.set([]);
          }

          // Fetch journey stats
          if (detail) {
            const stats = await this.exerciseService.getExerciseJourneyStats(id);
            this.highestWeight.set(stats.highestWeight);
            this.highestWeightReps.set(stats.highestWeightReps);
            this.totalSets.set(stats.totalSets);
            this.lastLogged.set(stats.lastLogged);
            this.recentSessions.set(stats.recentSessions);
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
