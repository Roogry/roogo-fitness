import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header';
import { LucideAngularModule, Activity } from 'lucide-angular';

@Component({
  selector: 'app-journey',
  imports: [HeaderComponent, LucideAngularModule],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
})
export class Journey {
  readonly Activity = Activity;
}
