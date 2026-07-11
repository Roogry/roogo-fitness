import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideUpload } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { DbService } from '@/core/services/db.service';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { downloadJson, readJsonFile } from '@/shared/utils';

@Component({
  selector: 'app-profile-backup',
  imports: [NgIcon, ZardButtonComponent],
  providers: [provideIcons({ lucideDownload, lucideUpload })],
  templateUrl: './profile-backup.html',
})
export class ProfileBackup {
  private readonly dbService = inject(DbService);
  private readonly dialogService = inject(ZardDialogService);

  async exportData() {
    try {
      const data = await this.dbService.exportBackup();
      const date = new Date().toISOString().split('T')[0];
      const filename = `roogo-fitness-backup-${date}.json`;
      downloadJson(data, filename);
    } catch (err) {
      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Export Failed',
        zDescription: 'Could not generate backup file.',
        zOkText: 'OK',
      });
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      const backup = await readJsonFile(file);

      if (
        !backup ||
        typeof backup !== 'object' ||
        backup.version === undefined ||
        !Array.isArray(backup.workout_plans) ||
        !Array.isArray(backup.logged_sessions)
      ) {
        throw new Error('Invalid backup file structure.');
      }

      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Confirm Import',
        zDescription:
          'Importing data will overwrite your current local data. Are you sure you want to proceed?',
        zOkText: 'Import',
        zOkDestructive: true,
        zCancelText: 'Cancel',
        zOnOk: async () => {
          try {
            await this.dbService.importBackup(backup);
            this.dialogService.create({
              zWidth: '400px',
              zTitle: 'Success',
              zDescription: 'Backup data successfully restored!',
              zOkText: 'OK',
            });
          } catch (err) {
            this.dialogService.create({
              zWidth: '400px',
              zTitle: 'Error',
              zDescription: 'Failed to import backup data into IndexedDB.',
              zOkText: 'OK',
            });
          }
        },
      });
    } catch (err) {
      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Invalid File',
        zDescription: 'The selected file is not a valid backup file or is corrupted.',
        zOkText: 'OK',
      });
    } finally {
      input.value = '';
    }
  }
}
