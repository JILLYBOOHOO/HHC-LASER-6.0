import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface MediaItem {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-heading text-white mb-2">Media Library</h1>
          <p class="text-charcoal-500">Manage images and videos used across your website.</p>
        </div>
        
        <!-- File Input hidden, triggered by button -->
        <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept="image/*,video/mp4" />
        
        <button mat-flat-button class="!bg-gold-500 !text-black hover:!bg-gold-600" (click)="fileInput.click()" [disabled]="uploading()">
          <mat-icon>{{ uploading() ? 'hourglass_empty' : 'upload' }}</mat-icon> 
          {{ uploading() ? 'Uploading...' : 'Upload Media' }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (item of mediaItems(); track item.id) {
            <div class="group bg-white rounded-xl overflow-hidden border border-cream-200 shadow-sm relative">
              
              <!-- Preview -->
              <div class="aspect-square bg-gray-100 relative">
                @if (item.file_type === 'image') {
                  <img loading="lazy" [src]="item.file_url" class="w-full h-full object-cover" />
                } @else if (item.file_type === 'video') {
                  <div class="w-full h-full flex items-center justify-center bg-gray-900">
                    <mat-icon class="text-black !text-4xl !w-10 !h-10">play_circle</mat-icon>
                  </div>
                }
                
                <!-- Overlay actions -->
                <div class="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button mat-icon-button class="text-black hover:text-gold-400" (click)="copyUrl(item.file_url)" title="Copy URL">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <button mat-icon-button class="text-black hover:text-red-400" (click)="deleteMedia(item.id)" title="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Info -->
              <div class="p-3">
                <div class="text-sm font-medium text-gray-50 truncate" [title]="item.file_name">{{ item.file_name }}</div>
                <div class="text-xs text-charcoal-400 flex justify-between mt-1">
                  <span class="uppercase">{{ item.file_type }}</span>
                  <span>{{ (item.size_bytes / 1024 / 1024) | number:'1.2-2' }} MB</span>
                </div>
              </div>
            </div>
          }
        </div>
        
        @if (mediaItems().length === 0) {
          <div class="text-center py-20 text-charcoal-400 border-2 border-dashed border-cream-200 rounded-2xl">
            <mat-icon class="!text-5xl !w-12 !h-12 mb-4 opacity-50">collections</mat-icon>
            <p>No media files uploaded yet.</p>
          </div>
        }
      }

    </div>
  `
})
export class AdminMediaComponent implements OnInit {
  private http = inject(HttpClient);
  
  mediaItems = signal<MediaItem[]>([]);
  loading = signal(true);
  uploading = signal(false);

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.loading.set(true);
    this.http.get<{success: boolean, data: MediaItem[]}>(`${environment.apiUrl}/media`)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            // Append localhost prefix for mock local storage URLs so they load in UI
            const apiBase = environment.apiUrl.replace('/api', '');
            const normalized = res.data.map(m => {
              if (m.file_url.startsWith('/uploads')) {
                return { ...m, file_url: apiBase + m.file_url };
              }
              return m;
            });
            this.mediaItems.set(normalized);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploading.set(true);
      const formData = new FormData();
      formData.append('file', file);
      
      this.http.post(`${environment.apiUrl}/media/upload`, formData)
        .subscribe({
          next: () => {
            this.uploading.set(false);
            this.loadMedia(); // reload
          },
          error: () => this.uploading.set(false)
        });
    }
  }

  deleteMedia(id: number) {
    if (confirm('Are you sure you want to delete this media file?')) {
      this.http.delete(`${environment.apiUrl}/media/${id}`)
        .subscribe({
          next: () => this.loadMedia()
        });
    }
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  }
}
