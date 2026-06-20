import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideActivity, lucideUser, lucideBookOpen } from '@ng-icons/lucide';

/**
 * Navigation bar displayed at the bottom of the screen.
 * Provides main application routing links.
 * 
 * @example
 * <app-bottom-nav></app-bottom-nav>
 */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterModule, NgIcon],
  providers: [provideIcons({ lucideHouse, lucideActivity, lucideUser, lucideBookOpen })],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {}
