import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ExerciseDetail } from './components/exercise-detail/exercise-detail';
import { ExerciseEdit } from './components/exercise-edit/exercise-edit';
import { MainLayout } from './shared/components/main-layout/main-layout';
import { Journey } from './journey/journey';
import { Profile } from './profile/profile';
import { WorkoutSession } from './workout-session/workout-session';
import { BlueprintComponent } from './blueprint/blueprint';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'journey', component: Journey },
      { path: 'blueprint', component: BlueprintComponent },
      { path: 'profile', component: Profile },
    ]
  },
  { path: 'exercise/:id', component: ExerciseDetail },
  { path: 'exercise/:id/edit', component: ExerciseEdit },
  { path: 'workout/session', component: WorkoutSession },
];
