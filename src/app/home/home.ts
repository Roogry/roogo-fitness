import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card';
import {
  LucideAngularModule,
  Dumbbell,
  Play,
  Calendar,
  ChevronRight,
  Flame,
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, ZardCardComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background text-foreground pb-24">
      <!-- Header -->
      <div class="container max-w-2xl mx-auto px-4 pt-6">
        <div class="flex items-center gap-4">
          <div class="size-16 rounded-full bg-secondary flex items-center justify-center">
            <lucide-icon [img]="Dumbbell" class="size-6"></lucide-icon>
          </div>
          <div class="flex flex-col gap-1">
            <h1 class="text-xl font-bold">Ganbatte, Jodie!</h1>
            <div class="flex items-center gap-1">
              <p class="text-sm text-muted-foreground">3 days this week</p>
              <lucide-icon [img]="Flame" class="h-3 w-3"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <main class="container mx-auto px-4 max-w-2xl mt-8">
        <!-- Hero Card: Current Plan & Session -->
        <z-card class="mb-6 block hover:border-primary/50 transition-colors cursor-pointer group">
          <div class="flex justify-between items-start mb-6">
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-primary mb-1 uppercase tracking-wider"
                >Current Plan</span
              >
              <h2 class="text-2xl font-bold">Push Pull Legs (PPL)</h2>
              <div class="flex items-center text-sm text-muted-foreground mt-2 gap-2">
                <lucide-icon [img]="Calendar" class="w-4 h-4"></lucide-icon>
                <span>3 days / week</span>
              </div>
            </div>
            <div
              class="bg-primary/5 text-primary p-3 rounded-2xl"
            >
              <lucide-icon [img]="Dumbbell" class="w-6 h-6"></lucide-icon>
            </div>
          </div>

          <div
            class="bg-secondary/40 rounded-[16px] p-4 flex justify-between items-center group-hover:bg-secondary/60 transition-colors"
          >
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground mb-1">Up Next</span>
              <span class="font-semibold text-secondary-foreground text-lg">Push Day Heavy</span>
            </div>
            <button z-button zShape="circle" zType="outline" zSize="icon" class="group-hover:bg-primary group-hover:text-white">
              <lucide-icon [img]="ChevronRight"></lucide-icon>
            </button>
          </div>
        </z-card>

        <!-- Start Empty Workout Action -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4 px-1">
            <h3 class="font-semibold text-lg">Quick Actions</h3>
          </div>
          <a
            routerLink="/workout/session"
            class="flex items-center justify-center gap-3 w-full bg-white border-1 border-border py-5 px-6 rounded-xl font-semibold text-lg hover:bg-secondary/60 hover:text-primary/80 cursor-pointer transition-all"
          >
            <lucide-icon [img]="Play" class="w-6 h-6"></lucide-icon>
            Start Empty Workout
          </a>
        </div>
      </main>
    </div>
  `,
  styles: [],
})
export class Home {
  readonly Dumbbell = Dumbbell;
  readonly Play = Play;
  readonly Calendar = Calendar;
  readonly ChevronRight = ChevronRight;
  readonly Flame = Flame;
}
