import { Component } from '@angular/core';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser } from '@ng-icons/lucide';
import { ProfileBackup } from '../../components/profile-backup/profile-backup';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, NgIcon, ProfileBackup],
  providers: [provideIcons({ lucideUser })],
  templateUrl: './profile.html',
})
export class Profile {}
