import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ExerciseDetail } from './components/exercise-detail/exercise-detail';
import { ExerciseEdit } from './components/exercise-edit/exercise-edit';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'exercise/:id', component: ExerciseDetail },
  { path: 'exercise/:id/edit', component: ExerciseEdit },
];
