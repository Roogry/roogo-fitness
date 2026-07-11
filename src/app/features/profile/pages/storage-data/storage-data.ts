import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ProfileBackup } from '../../components/profile-backup/profile-backup';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { DbService } from '@/core/services/db.service';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDatabase } from '@ng-icons/lucide';

@Component({
  selector: 'app-storage-data',
  imports: [HeaderComponent, ProfileBackup, ZardButtonComponent, NgIcon],
  providers: [provideIcons({ lucideDatabase })],
  templateUrl: './storage-data.html',
})
export class StorageDataPage {
  private readonly dbService = inject(DbService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly router = inject(Router);

  onClearData() {
    this.dialogService.create({
      zWidth: '400px',
      zTitle: 'Clear All Data',
      zDescription:
        'Are you sure you want to clear all data? This action will reset the application to its initial state and cannot be undone.',
      zOkText: 'Clear Data',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zOnOk: async () => {
        try {
          await this.dbService.clearAllData();
          this.dialogService.create({
            zWidth: '400px',
            zTitle: 'Success',
            zDescription:
              'All customized data has been cleared and default data has been restored.',
            zOkText: 'OK',
            zOnOk: () => {
              window.location.reload();
            },
          });
        } catch (error) {
          this.dialogService.create({
            zWidth: '400px',
            zTitle: 'Error',
            zDescription: 'Failed to clear application data.',
            zOkText: 'OK',
          });
        }
      },
    });
  }
}
