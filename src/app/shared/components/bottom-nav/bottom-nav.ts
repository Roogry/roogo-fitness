import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Home, Activity, User, BookOpen } from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {
  readonly Home = Home;
  readonly Activity = Activity;
  readonly User = User;
  readonly BookOpen = BookOpen;
}
