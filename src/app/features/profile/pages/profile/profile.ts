import { Component } from '@angular/core';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideChevronRight } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, NgIcon, RouterLink],
  providers: [provideIcons({ lucideUser, lucideChevronRight })],
  templateUrl: './profile.html',
})
export class Profile {}
