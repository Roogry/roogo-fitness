import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-pills',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'flex p-1 bg-muted/60 rounded-full w-full max-w-xs mx-auto mb-2 border border-border/50',
  },
})
export class NavPillsComponent {}
