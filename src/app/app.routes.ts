import { Routes } from '@angular/router';
import { ExerciseDetail } from './components/exercise-detail/exercise-detail';
import { ExerciseEdit } from './components/exercise-edit/exercise-edit';
import { MainLayout } from './shared/components/main-layout/main-layout';
import { Profile } from './pages/profile/profile';
import { Home } from './pages/home/home';
import { Journey } from './pages/journey/journey';
import { BlueprintComponent } from './pages/blueprint/blueprint';
import { WorkoutSession } from './pages/workout-session/workout-session';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'journey', component: Journey },
      { path: 'blueprint', component: BlueprintComponent },
      { path: 'profile', component: Profile },
    ],
  },
  { path: 'exercise/:id', component: ExerciseDetail },
  { path: 'exercise/:id/edit', component: ExerciseEdit },
  { path: 'workout/session', component: WorkoutSession },
];
