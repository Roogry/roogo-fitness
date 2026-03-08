import { Component } from '@angular/core';
import { HeaderComponent } from '@/shared/components/header/header';
import { LucideAngularModule, User } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly User = User;
}
