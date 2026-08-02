import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { IntakeForm, TreatmentNote } from '../../../core/models/models';

@Component({
  selector: 'app-customer-medical',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 class="text-3xl font-heading text-black">Medical Information</h1>
        <p class="text-neutral-600 mt-1">Your intake form and treatment history.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <section class="card p-6 space-y-4">
          <h2 class="text-lg font-bold text-black">Medical Intake Form</h2>
          <form (ngSubmit)="saveIntake()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="block text-sm">
              <span class="text-charcoal-500">Fitzpatrick Skin Type</span>
              <select [(ngModel)]="form.fitzpatrick_type" name="fitzpatrick_type" class="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="">Select...</option>
                @for (t of ['I','II','III','IV','V','VI']; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </label>
            <label class="block text-sm md:col-span-2">
              <span class="text-charcoal-500">Allergies</span>
              <textarea [(ngModel)]="form.allergies" name="allergies" rows="2" class="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
            </label>
            <label class="block text-sm md:col-span-2">
              <span class="text-charcoal-500">Current Medications</span>
              <textarea [(ngModel)]="form.medications" name="medications" rows="2" class="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
            </label>
            <label class="block text-sm md:col-span-2">
              <span class="text-charcoal-500">Skin Conditions</span>
              <textarea [(ngModel)]="form.skin_conditions" name="skin_conditions" rows="2" class="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
            </label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="form.pregnancy_status" name="pregnancy_status"> Pregnant or nursing</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="form.pacemaker_status" name="pacemaker_status"> Pacemaker or metal implants</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="form.keloid_history" name="keloid_history"> History of keloids</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="form.sun_exposure_recent" name="sun_exposure_recent"> Recent sun exposure</label>
            <div class="md:col-span-2">
              <button mat-flat-button type="submit" class="!bg-black !text-white">Save Intake Form</button>
            </div>
          </form>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-bold text-black">Treatment History</h2>
          @for (note of history(); track note.id) {
            <div class="card p-5">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-black">{{ note.service_name }}</h3>
                <span class="text-xs text-charcoal-400">{{ note.created_at | date:'mediumDate' }}</span>
              </div>
              <p class="text-sm text-charcoal-500 mb-2">Specialist: {{ note.specialist_name }}</p>
              <p class="text-sm text-charcoal-700">{{ note.notes }}</p>
            </div>
          } @empty {
            <div class="card p-8 text-center text-charcoal-500">
              <mat-icon class="!text-4xl mb-2 text-charcoal-300">history</mat-icon>
              <p>No treatment history recorded yet.</p>
            </div>
          }
        </section>
      }
    </div>
  `
})
export class CustomerMedicalComponent implements OnInit {
  private api = inject(ApiService);
  private authState = inject(AuthStateService);

  form: IntakeForm = {
    pregnancy_status: false,
    pacemaker_status: false,
    keloid_history: false,
    sun_exposure_recent: false,
  };
  history = signal<TreatmentNote[]>([]);
  loading = signal(true);
  saved = signal(false);

  ngOnInit() {
    const userId = this.authState.user()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.api.getIntakeForm(userId).subscribe({
      next: res => {
        if (res.data) {
          this.form = {
            ...this.form,
            ...res.data,
            pregnancy_status: !!res.data.pregnancy_status,
            pacemaker_status: !!res.data.pacemaker_status,
            keloid_history: !!res.data.keloid_history,
            sun_exposure_recent: !!res.data.sun_exposure_recent,
          };
        }
      }
    });
    this.api.getTreatmentHistory(userId).subscribe({
      next: res => {
        this.history.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveIntake() {
    const userId = this.authState.user()?.id;
    if (!userId) return;
    this.api.submitIntakeForm(userId, this.form).subscribe({
      next: () => this.saved.set(true)
    });
  }
}
