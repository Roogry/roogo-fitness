import { Component } from '@angular/core';
import { HeaderComponent } from '@/shared/components/header/header';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser } from '@ng-icons/lucide';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, NgIcon],
  providers: [provideIcons({ lucideUser })],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {}
