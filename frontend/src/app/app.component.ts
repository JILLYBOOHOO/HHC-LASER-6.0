import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './core/services/settings.service';
import { AuthStateService } from './core/store/auth-state.service';
import { DraftService } from './core/services/draft.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResumeDraftDialogComponent } from './shared/components/resume-draft-dialog/resume-draft-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  title = 'hhc-laser-frontend';
  private settingsService = inject(SettingsService);
  private authState = inject(AuthStateService);
  private draftService = inject(DraftService);
  private dialog = inject(MatDialog);

  constructor() {
    // Watch for authentication to check for active drafts
    effect(() => {
      const isAuth = this.authState.isAuthenticated();
      if (isAuth) {
        this.draftService.loadDraft().subscribe(draft => {
          if (draft && !draft.resume_prompt_dismissed) {
            this.dialog.open(ResumeDraftDialogComponent, {
              data: { draft },
              width: '100%',
              maxWidth: '440px',
              disableClose: true,
            });
          }
        });
      }
    });
  }

  ngOnInit() {
    this.settingsService.loadSettings();
  }
}
