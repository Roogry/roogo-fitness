import { Routes } from '@angular/router';
import { ExerciseDetail } from './features/exercise/pages/exercise-detail/exercise-detail';
import { ExerciseEdit } from './features/exercise/pages/exercise-edit/exercise-edit';
import { MainLayout } from './shared/components/main-layout/main-layout';
import { Profile } from './features/profile/profile';
import { Home } from './features/home/home';
import { JourneyList } from './features/journey/pages/journey-list/journey-list';
import { BlueprintList } from './features/blueprint/pages/blueprint-list/blueprint-list';
import { SessionActive } from './features/workout-session/pages/session-active/session-active';
import { SessionDetail } from './features/workout-session/pages/session-detail/session-detail';
import { BlueprintSession } from './features/blueprint/pages/blueprint-session/blueprint-session';
import { JourneyDetail } from './features/journey/pages/journey-detail/journey-detail';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'journey', component: JourneyList },
      { path: 'blueprint', component: BlueprintList },
      { path: 'profile', component: Profile },
    ],
  },
  { path: 'exercise/:id', component: ExerciseDetail },
  { path: 'exercise/:id/edit', component: ExerciseEdit },
  { path: 'session/active', component: SessionActive },
  { path: 'session/detail', component: SessionDetail },
  { path: 'journey/:id', component: JourneyDetail },
  { path: 'blueprint/:id/session/:action', component: BlueprintSession },
];
