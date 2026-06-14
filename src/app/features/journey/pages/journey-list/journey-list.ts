import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
export class JourneyList implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = signal<'stats' | 'history'>('stats');

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const tabParam = params.get('tab');
      if (tabParam === 'history' || tabParam === 'stats') {
        this.activeTab.set(tabParam);
      }
    });
  }

  setTab(tab: 'stats' | 'history') {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }
}
