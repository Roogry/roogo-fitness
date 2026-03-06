import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ExerciseDetail } from './components/exercise-detail/exercise-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'exercise/:id', component: ExerciseDetail },
];
