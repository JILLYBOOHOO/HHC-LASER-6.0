import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface HomepageSection {
  id: number;
  section_type: string;
  display_order: number;
  is_active: boolean;
  config_json: any;
}

@Component({
  selector: 'app-admin-homepage-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-heading text-charcoal-900 mb-2">Homepage Builder</h1>
          <p class="text-charcoal-500">Drag and drop sections to rearrange your live homepage.</p>
        </div>
        <button mat-flat-button class="!bg-gold-500 !text-white" (click)="saveOrder()" [disabled]="saving()">
          {{ saving() ? 'Saving...' : 'Save Layout' }}
        </button>
      </div>

      @if (loading()) {
        <div class="text-center py-10 text-charcoal-400">Loading sections...</div>
      } @else {
        <div cdkDropList class="space-y-4" (cdkDropListDropped)="drop($event)">
          @for (section of sections(); track section.id) {
            <div cdkDrag class="bg-white border border-cream-200 rounded-xl p-4 flex items-center gap-4 shadow-sm cursor-move hover:shadow-md transition-shadow">
              <!-- Drag Handle -->
              <div class="text-gray-300">
                <mat-icon>drag_indicator</mat-icon>
              </div>
              
              <!-- Section Info -->
              <div class="flex-1">
                <div class="font-medium text-charcoal-900 capitalize text-lg">
                  {{ section.section_type.replace('_', ' ') }}
                </div>
                <div class="text-xs text-charcoal-400 mt-1">ID: {{ section.id }} | Status: {{ section.is_active ? 'Active' : 'Hidden' }}</div>
              </div>
              
              <!-- Actions -->
              <div>
                <button mat-icon-button class="text-charcoal-400 hover:text-gold-600">
                  <mat-icon>settings</mat-icon>
                </button>
                <button mat-icon-button class="text-charcoal-400 hover:text-red-500">
                  <mat-icon>visibility_off</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AdminHomepageBuilderComponent implements OnInit {
  private http = inject(HttpClient);
  
  sections = signal<HomepageSection[]>([]);
  loading = signal(true);
  saving = signal(false);

  ngOnInit() {
    this.http.get<{success: boolean, data: HomepageSection[]}>(`${environment.apiUrl}/homepage/all`)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            // Sort by order initially
            this.sections.set(res.data.sort((a, b) => a.display_order - b.display_order));
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  drop(event: CdkDragDrop<HomepageSection[]>) {
    const currentSections = [...this.sections()];
    moveItemInArray(currentSections, event.previousIndex, event.currentIndex);
    
    // Update order property
    currentSections.forEach((sec, idx) => sec.display_order = idx);
    this.sections.set(currentSections);
  }

  saveOrder() {
    this.saving.set(true);
    const payload = {
      items: this.sections().map(s => ({ id: s.id, display_order: s.display_order }))
    };
    
    this.http.put(`${environment.apiUrl}/homepage/reorder`, payload)
      .subscribe({
        next: () => this.saving.set(false),
        error: () => this.saving.set(false)
      });
  }
}
