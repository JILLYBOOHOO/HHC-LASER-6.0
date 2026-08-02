import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  category: string;
  tagCode: string;
  imageUrl: string;
  isBeforeAfter?: boolean;
  beforeUrl?: string;
  afterUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
}

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      
      <!-- Top Header & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gallery</h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage your image gallery and showcase content</p>
        </div>
        <button (click)="openAddModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto">
          <mat-icon class="!text-base">add</mat-icon>
          <span>Add Image</span>
        </button>
      </div>

      <!-- 4 Stat Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Total Images -->
        <div class="p-5 rounded-2xl bg-indigo-100/70 border border-indigo-200/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Total Images</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">12</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">insights</mat-icon>
              <span>All images</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-indigo-200/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">collections</mat-icon>
          </div>
        </div>

        <!-- Active Images -->
        <div class="p-5 rounded-2xl bg-slate-200/70 border border-slate-300/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Active Images</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">12</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">visibility</mat-icon>
              <span>Currently visible</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-slate-300/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">visibility</mat-icon>
          </div>
        </div>

        <!-- Featured Images -->
        <div class="p-5 rounded-2xl bg-rose-100/70 border border-rose-200/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Featured Images</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">2</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">star_outline</mat-icon>
              <span>Highlighted content</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-rose-200/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">star_outline</mat-icon>
          </div>
        </div>

        <!-- Categories -->
        <div class="p-5 rounded-2xl bg-blue-100/70 border border-blue-200/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Categories</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">4</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">sell</mat-icon>
              <span>Image groups</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-blue-200/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">sell</mat-icon>
          </div>
        </div>

      </div>

      <!-- Filter Controls Bar -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
        <!-- Search Field -->
        <div class="relative md:col-span-1">
          <mat-icon class="absolute left-3 top-2.5 !text-base text-slate-400">search</mat-icon>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Search images..."
                 class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700">
        </div>

        <!-- Category Dropdown -->
        <select [(ngModel)]="selectedCategory" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
          <option value="all">All Categories</option>
          <option value="treatments">Treatments</option>
          <option value="facility">Facility</option>
          <option value="general">General</option>
          <option value="beforeafter">Before & After</option>
        </select>

        <!-- Status Dropdown -->
        <select [(ngModel)]="selectedStatus" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <!-- Image Type Dropdown -->
        <select [(ngModel)]="selectedImageType" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
          <option value="all">All Images</option>
          <option value="featured">Featured Only</option>
          <option value="standard">Standard Only</option>
        </select>

        <!-- Apply Button -->
        <button class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-200">
          <mat-icon class="!text-sm text-slate-500">filter_alt</mat-icon>
          <span>Apply Filters</span>
        </button>
      </div>

      <!-- Gallery Grid Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (item of filteredItems; track item.id) {
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            
            <!-- Image Header Container -->
            <div class="relative h-48 bg-slate-100 overflow-hidden">
              @if (item.isBeforeAfter) {
                <div class="grid grid-cols-2 h-full relative">
                  <div class="relative h-full">
                    <img loading="lazy" [src]="item.beforeUrl" class="w-full h-full object-cover">
                    <span class="absolute bottom-2 left-2 px-2 py-0.5 bg-cyan-500/90 text-black font-bold text-[10px] rounded">Before</span>
                  </div>
                  <div class="relative h-full">
                    <img loading="lazy" [src]="item.afterUrl" class="w-full h-full object-cover">
                    <span class="absolute top-2 right-2 px-2 py-0.5 bg-teal-100 text-teal-700 font-bold text-[10px] rounded-full border border-teal-200">Active</span>
                    <span class="absolute bottom-2 right-2 px-2 py-0.5 bg-cyan-500/90 text-black font-bold text-[10px] rounded">After</span>
                  </div>
                </div>
              } @else {
                <img loading="lazy" [src]="item.imageUrl" class="w-full h-full object-cover">
                
                <!-- Status Badges Overlay -->
                <div class="absolute top-2 right-2 flex items-center gap-1.5">
                  @if (item.isFeatured) {
                    <span class="px-2 py-0.5 bg-amber-100/95 text-amber-800 font-bold text-[10px] rounded-full border border-amber-300 flex items-center gap-0.5">
                      <mat-icon class="!text-[11px]">star</mat-icon>
                      <span>Featured</span>
                    </span>
                  }
                  @if (item.isActive) {
                    <span class="px-2 py-0.5 bg-teal-100/95 text-teal-700 font-bold text-[10px] rounded-full border border-teal-300">
                      Active
                    </span>
                  }
                </div>
              }
            </div>

            <!-- Card Body Content -->
            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-bold text-xs text-slate-900 tracking-tight uppercase">{{ item.title }}</h3>
                  <button class="text-slate-400 hover:text-slate-600"><mat-icon class="!text-base">more_vert</mat-icon></button>
                </div>
                @if (item.description) {
                  <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">{{ item.description }}</p>
                }
              </div>

              <div class="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
                <span class="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{{ item.category }}</span>
                <span>{{ item.tagCode }}</span>
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class AdminGalleryComponent {
  searchQuery: string = '';
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';
  selectedImageType: string = 'all';

  items: GalleryItem[] = [
    {
      id: 1,
      title: 'From the Start',
      description: 'Beer Creating Before & After Pictures Before Instagram',
      category: 'Before & After',
      tagCode: '#0',
      imageUrl: '',
      isBeforeAfter: true,
      beforeUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80',
      afterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      isActive: true,
      isFeatured: false
    },
    {
      id: 2,
      title: 'LASER HAIR REMOVAL',
      description: '',
      category: 'Treatments',
      tagCode: '#0',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
      isActive: true,
      isFeatured: false
    },
    {
      id: 3,
      title: 'Modern Laser Treatment Room',
      description: 'State of the art laser treatment facility with cutting-edge laser technology',
      category: 'facility',
      tagCode: '#1',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
      isActive: true,
      isFeatured: true
    },
    {
      id: 4,
      title: 'Professional Consultation',
      description: 'Expert dermatologist consultation for personalized treatment plans',
      category: 'General',
      tagCode: '#2',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
      isActive: true,
      isFeatured: true
    }
  ];

  get filteredItems(): GalleryItem[] {
    return this.items.filter(item => {
      const matchesSearch = !this.searchQuery || item.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || (this.selectedStatus === 'active' && item.isActive);
      const matchesType = this.selectedImageType === 'all' || (this.selectedImageType === 'featured' && item.isFeatured);
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  openAddModal(): void {
    alert('Add Image dialog opened! (Demo)');
  }
}
