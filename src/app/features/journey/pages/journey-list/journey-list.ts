import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { NavPillsComponent, NavPillsItemComponent } from '@/shared/components/nav-pills';
import { JourneyHistoryComponent } from '../journey-history/journey-history';
import { JourneyStatsComponent } from '../journey-stats/journey-stats';

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    NavPillsComponent,
    NavPillsItemComponent,
    JourneyHistoryComponent,
    JourneyStatsComponent,
  ],
  templateUrl: './journey-list.html',
})
export class JourneyList {
  activeTab = signal<'stats' | 'history'>('stats');

  setTab(tab: 'stats' | 'history') {
    this.activeTab.set(tab);
  }
}
