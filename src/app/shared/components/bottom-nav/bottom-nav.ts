import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideActivity, lucideUser, lucideBookOpen } from '@ng-icons/lucide';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterModule, NgIcon],
  providers: [provideIcons({ lucideHouse, lucideActivity, lucideUser, lucideBookOpen })],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {}
