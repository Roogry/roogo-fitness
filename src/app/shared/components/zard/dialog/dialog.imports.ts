import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardDialogComponent } from '@/shared/components/zard/dialog/dialog.component';

export const ZardDialogImports = [ZardButtonComponent, ZardDialogComponent, OverlayModule, PortalModule] as const;
