import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800 bg-[#f8fafc] min-h-screen">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-4xl font-serif font-bold text-slate-900 leading-none">Patients</h1>
          <p class="text-xs font-bold text-slate-500 mt-2">All registered customers and their visit history.</p>
        </div>
        <div class="relative">
          <mat-icon class="absolute left-3 top-2.5 !text-sm text-slate-400">search</mat-icon>
          <input type="text" [(ngModel)]="search" (keyup.enter)="load()" placeholder="Search patients..."
                 class="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 w-64 focus:outline-none focus:border-[#b8924f] placeholder:text-slate-400" />
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="text-left px-5 py-3 font-black">Patient</th>
                <th class="text-left px-5 py-3 font-black">Contact</th>
                <th class="text-left px-5 py-3 font-black">Appointments</th>
                <th class="text-left px-5 py-3 font-black">Lifetime Value</th>
                <th class="text-left px-5 py-3 font-black">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (p of patients(); track p.id) {
                <tr
                  class="hover:bg-slate-50 cursor-pointer transition-colors"
                  (click)="openPatient(p)"
                  title="View patient profile and history">
                  <td class="px-5 py-4">
                    <div class="font-semibold text-slate-900">{{ p.first_name }} {{ p.last_name }}</div>
                    <div class="text-xs text-slate-500">Since {{ p.created_at | date:'mediumDate' }}</div>
                  </td>
                  <td class="px-5 py-4 text-slate-600">
                    <div>{{ p.email }}</div>
                    <div class="text-xs text-slate-500">{{ p.phone || '—' }}</div>
                  </td>
                  <td class="px-5 py-4 text-slate-800 font-semibold">{{ p.total_appointments || 0 }}</td>
                  <td class="px-5 py-4 text-[#b8924f] font-bold">J$ {{ p.lifetime_value | number:'1.0-0' }}</td>
                  <td class="px-5 py-4">
                    <span class="text-xs px-2.5 py-1 rounded-full font-bold"
                          [ngClass]="p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'">
                      {{ p.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-5 py-12 text-center text-slate-500">No patients found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (selectedPatient()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" (click)="closePatient()">
        <div
          class="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col"
          (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50/80">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-[#b8924f]/15 text-[#b8924f] font-black flex items-center justify-center shrink-0">
                {{ initials(selectedPatient()!) }}
              </div>
              <div class="min-w-0">
                <h2 class="text-xl font-black text-slate-900 truncate">
                  {{ selectedPatient()!.first_name }} {{ selectedPatient()!.last_name }}
                </h2>
                <p class="text-xs text-slate-500 mt-0.5 font-medium">Patient profile & visit history</p>
              </div>
            </div>
            <button
              type="button"
              (click)="closePatient()"
              class="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-1 px-6 pt-4 border-b border-slate-200 bg-white">
            @for (tab of detailTabs; track tab.id) {
              <button
                type="button"
                (click)="detailTab.set(tab.id)"
                class="px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors"
                [class.border-[#b8924f]]="detailTab() === tab.id"
                [class.text-[#b8924f]]="detailTab() === tab.id"
                [class.border-transparent]="detailTab() !== tab.id"
                [class.text-slate-500]="detailTab() !== tab.id">
                {{ tab.label }}
              </button>
            }
          </div>

          <div class="overflow-y-auto p-6 flex-1 bg-[#f8fafc]">
            @if (detailError()) {
              <div class="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
                {{ detailError() }}
              </div>
            }

            @if (patientDetail()) {
              @if (detailTab() === 'profile') {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Contact</div>
                    <div class="space-y-3 text-sm">
                      <div>
                        <div class="text-slate-500 text-xs font-bold">Email</div>
                        <div class="text-slate-800">{{ patientDetail()!.profile.email || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-slate-500 text-xs font-bold">Phone</div>
                        <div class="text-slate-800">{{ patientDetail()!.profile.phone || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-slate-500 text-xs font-bold">Member since</div>
                        <div class="text-slate-800">{{ patientDetail()!.profile.created_at | date:'mediumDate' }}</div>
                      </div>
                      <div>
                        <div class="text-slate-500 text-xs font-bold">Account</div>
                        <span class="text-xs px-2.5 py-1 rounded-full font-bold"
                              [ngClass]="patientDetail()!.profile.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'">
                          {{ patientDetail()!.profile.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Summary</div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="text-3xl font-black text-slate-900">{{ patientDetail()!.profile.total_appointments || 0 }}</div>
                        <div class="text-xs text-slate-500 mt-1 font-bold">Appointments</div>
                      </div>
                      <div>
                        <div class="text-3xl font-black text-[#b8924f]">J$ {{ patientDetail()!.profile.lifetime_value | number:'1.0-0' }}</div>
                        <div class="text-xs text-slate-500 mt-1 font-bold">Lifetime value</div>
                      </div>
                    </div>
                  </div>

                  <div class="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                      <div class="text-[10px] font-black uppercase tracking-wider text-slate-500">Medical Intake</div>
                      @if (detailLoading()) {
                        <mat-spinner diameter="16"></mat-spinner>
                      }
                    </div>
                    @if (detailLoading() && patientDetail()!.intake === undefined) {
                      <p class="text-sm text-slate-500">Loading intake…</p>
                    } @else if (patientDetail()!.intake) {
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span class="text-slate-500 font-bold">Fitzpatrick:</span> <span class="text-slate-800">{{ patientDetail()!.intake.fitzpatrick_type || '—' }}</span></div>
                        <div><span class="text-slate-500 font-bold">Allergies:</span> <span class="text-slate-800">{{ patientDetail()!.intake.allergies || 'None listed' }}</span></div>
                        <div><span class="text-slate-500 font-bold">Medications:</span> <span class="text-slate-800">{{ patientDetail()!.intake.medications || 'None listed' }}</span></div>
                        <div><span class="text-slate-500 font-bold">Skin conditions:</span> <span class="text-slate-800">{{ patientDetail()!.intake.skin_conditions || 'None listed' }}</span></div>
                        <div class="sm:col-span-2"><span class="text-slate-500 font-bold">Notes:</span> <span class="text-slate-800">{{ patientDetail()!.intake.additional_notes || '—' }}</span></div>
                      </div>
                    } @else {
                      <p class="text-sm text-slate-500">No intake form on file.</p>
                    }
                  </div>
                </div>
              }

              @if (detailTab() === 'history') {
                @if (detailLoading() && (!patientDetail()!.appointments || patientDetail()!.appointments.length === 0)) {
                  <div class="flex justify-center py-16"><mat-spinner diameter="36"></mat-spinner></div>
                } @else {
                <div class="space-y-3">
                  @if (patientDetail()!.appointments.length === 0) {
                    <p class="text-sm text-slate-500 text-center py-10">No appointment history yet.</p>
                  } @else {
                    @for (appt of patientDetail()!.appointments; track appt.id) {
                      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div class="font-bold text-slate-900">{{ appt.service_name || 'Service' }}</div>
                            <div class="text-xs text-slate-500 mt-1 font-medium">
                              {{ formatDate(appt.appointment_date || appt.scheduled_date) }}
                              · {{ formatTime(appt.appointment_time || appt.start_time) }}
                              @if (appt.location_name) { · {{ appt.location_name }} }
                              @if (appt.employee_name) { · {{ appt.employee_name }} }
                            </div>
                            @if (appt.confirmation_code) {
                              <div class="text-[10px] font-mono text-slate-400 mt-1">#{{ appt.confirmation_code }}</div>
                            }
                          </div>
                          <div class="flex items-center gap-2 shrink-0">
                            <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                                  [ngClass]="statusClass(appt.status)">
                              {{ (appt.status || '').replace('_', ' ') }}
                            </span>
                            @if (appt.total_amount_jmd != null) {
                              <span class="text-xs font-bold text-[#b8924f]">J$ {{ appt.total_amount_jmd | number:'1.0-0' }}</span>
                            }
                          </div>
                        </div>

                        @if (appt.notes) {
                          <div class="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Appointment notes</div>
                            <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ appt.notes }}</p>
                          </div>
                        }

                        @if (appt.status_notes?.length) {
                          <div class="mt-3 space-y-2">
                            <div class="text-[10px] font-black uppercase tracking-wider text-slate-500">Status notes</div>
                            @for (note of appt.status_notes; track note.created_at + note.notes) {
                              <div class="text-xs text-slate-600 border-l-2 border-[#b8924f] pl-3">
                                <div class="text-slate-800">{{ note.notes }}</div>
                                <div class="text-[10px] text-slate-400 mt-0.5">
                                  {{ note.created_at | date:'medium' }}
                                  @if (note.changed_by_name) { · {{ note.changed_by_name }} }
                                  @if (note.new_status) { · {{ note.new_status.replace('_', ' ') }} }
                                </div>
                              </div>
                            }
                          </div>
                        }

                        @if (!appt.notes && !appt.status_notes?.length) {
                          <p class="mt-3 text-xs text-slate-400">No notes recorded for this appointment.</p>
                        }
                      </div>
                    }
                  }
                </div>
                }
              }

              @if (detailTab() === 'notes') {
                <div class="space-y-4">
                  <div class="flex rounded-xl overflow-hidden border border-slate-200 w-fit bg-white shadow-sm">
                    <button
                      type="button"
                      (click)="notesMode.set('view')"
                      class="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors"
                      [class.bg-[#b8924f]]="notesMode() === 'view'"
                      [class.text-white]="notesMode() === 'view'"
                      [class.bg-transparent]="notesMode() !== 'view'"
                      [class.text-slate-500]="notesMode() !== 'view'">
                      Previous Notes
                    </button>
                    <button
                      type="button"
                      (click)="notesMode.set('write')"
                      class="px-4 py-2 text-[10px] font-black uppercase tracking-wider border-l border-slate-200 transition-colors"
                      [class.bg-[#b8924f]]="notesMode() === 'write'"
                      [class.text-white]="notesMode() === 'write'"
                      [class.bg-transparent]="notesMode() !== 'write'"
                      [class.text-slate-500]="notesMode() !== 'write'">
                      Write Note
                    </button>
                  </div>

                  @if (notesMode() === 'write') {
                    <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
                      <div>
                        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Appointment</label>
                        <select
                          [(ngModel)]="noteAppointmentId"
                          class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#b8924f]">
                          <option [ngValue]="null">Select an appointment…</option>
                          @for (appt of patientDetail()!.appointments; track appt.id) {
                            <option [ngValue]="appt.id">
                              {{ formatDate(appt.appointment_date || appt.scheduled_date) }}
                              · {{ formatTime(appt.appointment_time || appt.start_time) }}
                              · {{ appt.service_name || 'Service' }}
                            </option>
                          }
                        </select>
                        @if (!patientDetail()!.appointments?.length) {
                          <p class="text-xs text-amber-600 mt-2 font-medium">This patient has no appointments to attach a note to.</p>
                        }
                      </div>

                      <div>
                        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Treatment note</label>
                        <textarea
                          [(ngModel)]="noteText"
                          rows="6"
                          maxlength="2000"
                          placeholder="Write clinical notes, observations, aftercare, settings used…"
                          class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b8924f] resize-y"></textarea>
                        <div class="text-[10px] text-slate-400 mt-1 text-right">{{ noteText.length }}/2000</div>
                      </div>

                      @if (noteError()) {
                        <div class="text-sm text-red-600 font-medium">{{ noteError() }}</div>
                      }
                      @if (noteSuccess()) {
                        <div class="text-sm text-emerald-600 font-medium">{{ noteSuccess() }}</div>
                      }

                      <div class="flex items-center gap-3">
                        <button
                          type="button"
                          (click)="saveTreatmentNote()"
                          [disabled]="savingNote() || !noteAppointmentId || !noteText.trim()"
                          class="px-5 py-2.5 bg-[#b8924f] hover:bg-[#a6803b] text-white text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-40 transition-colors shadow-sm">
                          {{ savingNote() ? 'Saving…' : 'Save Note' }}
                        </button>
                        <button
                          type="button"
                          (click)="notesMode.set('view')"
                          class="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  } @else if (detailLoading() && (!patientDetail()!.treatment_notes || patientDetail()!.treatment_notes.length === 0)) {
                    <div class="flex justify-center py-16"><mat-spinner diameter="36"></mat-spinner></div>
                  } @else {
                    <div class="space-y-3">
                      @if (patientDetail()!.treatment_notes.length === 0) {
                        <div class="text-center py-10 space-y-3">
                          <p class="text-sm text-slate-500">No previous treatment notes on file.</p>
                          <button
                            type="button"
                            (click)="notesMode.set('write')"
                            class="px-4 py-2 text-[10px] font-black uppercase tracking-wider border border-slate-200 text-slate-600 rounded-xl hover:border-[#b8924f] hover:text-[#b8924f] bg-white transition-colors">
                            Write first note
                          </button>
                        </div>
                      } @else {
                        @for (note of patientDetail()!.treatment_notes; track note.id) {
                          <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <div>
                                <div class="font-bold text-slate-900">{{ note.service_name || 'Treatment' }}</div>
                                <div class="text-xs text-slate-500 mt-0.5 font-medium">
                                  {{ note.created_at | date:'medium' }}
                                  @if (note.specialist_name) { · {{ note.specialist_name }} }
                                  @if (note.body_area) { · {{ note.body_area }} }
                                </div>
                              </div>
                            </div>
                            <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ note.notes }}</p>
                            @if (note.fluence || note.pulse_width || note.frequency_hz) {
                              <div class="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-600 font-bold">
                                @if (note.fluence) { <span class="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Fluence {{ note.fluence }}</span> }
                                @if (note.pulse_width) { <span class="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Pulse {{ note.pulse_width }}</span> }
                                @if (note.frequency_hz) { <span class="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">{{ note.frequency_hz }} Hz</span> }
                                @if (note.spot_size_mm) { <span class="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">{{ note.spot_size_mm }} mm</span> }
                                @if (note.passes) { <span class="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">{{ note.passes }} passes</span> }
                              </div>
                            }
                          </div>
                        }
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      </div>
    }
  `
})
export class AdminPatientsComponent implements OnInit {
  private api = inject(ApiService);

  patients = signal<any[]>([]);
  loading = signal(true);
  search = '';

  selectedPatient = signal<any | null>(null);
  patientDetail = signal<any | null>(null);
  detailLoading = signal(false);
  detailError = signal('');
  detailTab = signal<'profile' | 'history' | 'notes'>('profile');
  notesMode = signal<'view' | 'write'>('view');
  noteAppointmentId: number | null = null;
  noteText = '';
  savingNote = signal(false);
  noteError = signal('');
  noteSuccess = signal('');
  private detailCache = new Map<number, any>();

  readonly detailTabs: { id: 'profile' | 'history' | 'notes'; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'history', label: 'History' },
    { id: 'notes', label: 'Treatment Notes' },
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAdminCustomers(1, 50, this.search || undefined).subscribe({
      next: res => {
        this.patients.set((res as any).data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openPatient(patient: any) {
    this.selectedPatient.set(patient);
    this.detailError.set('');
    this.detailTab.set('profile');
    this.notesMode.set('view');
    this.noteAppointmentId = null;
    this.noteText = '';
    this.noteError.set('');
    this.noteSuccess.set('');

    // Show profile instantly from list data so the card doesn't wait on the network.
    this.patientDetail.set({
      profile: { ...patient },
      appointments: [],
      treatment_notes: [],
      intake: undefined,
    });

    const cached = this.detailCache.get(patient.id);
    if (cached) {
      this.patientDetail.set(cached);
      this.detailLoading.set(false);
      return;
    }

    this.detailLoading.set(true);
    this.api.getAdminCustomerDetail(patient.id).subscribe({
      next: (res) => {
        const data = (res as any).data ?? null;
        if (data) {
          this.detailCache.set(patient.id, data);
          // Ignore stale responses if another patient was opened.
          if (this.selectedPatient()?.id === patient.id) {
            this.patientDetail.set(data);
          }
        }
        this.detailLoading.set(false);
      },
      error: (err) => {
        if (this.selectedPatient()?.id === patient.id) {
          this.detailError.set(err?.error?.message || 'Failed to load patient details.');
        }
        this.detailLoading.set(false);
      },
    });
  }

  closePatient() {
    this.selectedPatient.set(null);
    this.patientDetail.set(null);
    this.detailError.set('');
    this.notesMode.set('view');
    this.noteAppointmentId = null;
    this.noteText = '';
    this.noteError.set('');
    this.noteSuccess.set('');
  }

  saveTreatmentNote() {
    const patient = this.selectedPatient();
    const appointmentId = this.noteAppointmentId;
    const notes = this.noteText.trim();
    if (!patient?.id || !appointmentId || !notes) return;

    const appointment = (this.patientDetail()?.appointments || []).find((a: any) => a.id === appointmentId);
    this.savingNote.set(true);
    this.noteError.set('');
    this.noteSuccess.set('');

    this.api.createAdminCustomerTreatmentNote(patient.id, {
      appointment_id: appointmentId,
      notes,
      service_id: appointment?.service_id || undefined,
    }).subscribe({
      next: (res) => {
        const created = (res as any).data;
        this.patientDetail.update((detail) => {
          if (!detail) return detail;
          const next = {
            ...detail,
            treatment_notes: [created, ...(detail.treatment_notes || [])],
          };
          this.detailCache.set(patient.id, next);
          return next;
        });
        this.noteText = '';
        this.noteAppointmentId = null;
        this.noteSuccess.set('Treatment note saved.');
        this.savingNote.set(false);
        this.notesMode.set('view');
      },
      error: (err) => {
        this.noteError.set(err?.error?.message || 'Could not save treatment note.');
        this.savingNote.set(false);
      },
    });
  }

  initials(p: any) {
    return `${p?.first_name?.[0] || ''}${p?.last_name?.[0] || ''}`.toUpperCase() || '?';
  }

  formatDate(date?: string) {
    if (!date) return '—';
    const raw = String(date).slice(0, 10);
    const [y, m, d] = raw.split('-').map(Number);
    if (!y || !m || !d) return raw;
    return new Date(y, m - 1, d).toLocaleDateString('en-JM', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(time?: string) {
    if (!time) return '—';
    const [hStr, mStr] = String(time).split(':');
    let h = Number(hStr);
    const m = (mStr || '00').slice(0, 2);
    if (Number.isNaN(h)) return time;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  statusClass(status?: string) {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'checked_in': return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'in_treatment': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'confirmed':
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'cancelled':
      case 'no_show': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  }
}
