import os
import re

admin_ts = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\bookings\admin-bookings.component.ts"
admin_html = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\bookings\admin-bookings.component.html"

staff_ts = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\employee\schedule\employee-schedule.component.ts"
staff_html = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\employee\schedule\employee-schedule.component.html"

# Fix TS: Add currentDate, date formatting, and navigation methods
def fix_ts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add variables if not exist
    if 'currentDate: Date =' not in content:
        content = content.replace(
            'export class ',
            '''export class '''
        )
        # Find the class opening
        class_idx = content.find('{', content.find('export class ')) + 1
        
        insert = """
  currentDate: Date = new Date();

  get dateRangeText(): string {
    const start = new Date(this.currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
  }

  goToToday() {
    this.currentDate = new Date();
  }

  previousWeek() {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() - 7);
    this.currentDate = d;
  }

  nextWeek() {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + 7);
    this.currentDate = d;
  }
"""
        content = content[:class_idx] + insert + content[class_idx:]
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix buttons
    content = content.replace(
        '<button class="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold transition-colors">Today</button>',
        '<button (click)="goToToday()" class="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold transition-colors">Today</button>'
    )
    
    content = content.replace(
        '<button class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"><mat-icon class="!text-[18px]">chevron_left</mat-icon></button>',
        '<button (click)="previousWeek()" class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"><mat-icon class="!text-[18px]">chevron_left</mat-icon></button>'
    )
    
    content = content.replace(
        '<button class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"><mat-icon class="!text-[18px]">chevron_right</mat-icon></button>',
        '<button (click)="nextWeek()" class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"><mat-icon class="!text-[18px]">chevron_right</mat-icon></button>'
    )
    
    content = content.replace(
        '<span>May 12 - 18, 2025</span>',
        '<span>{{ dateRangeText }}</span>'
    )
    
    # Fix layout cutoff
    content = content.replace(
        '<div class="flex-1 relative h-full">',
        '<div class="flex-1 relative h-full overflow-x-auto overflow-y-auto custom-scrollbar">'
    )
    
    # Add startDate to weekly calendar
    content = content.replace(
        '<app-weekly-calendar [events]="calendarEvents" (eventClick)="openReschedule($event)"></app-weekly-calendar>',
        '<app-weekly-calendar [startDate]="currentDate" [events]="calendarEvents" (eventClick)="openReschedule($event)"></app-weekly-calendar>'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_ts(admin_ts)
fix_html(admin_html)
fix_ts(staff_ts)
fix_html(staff_html)
print("Updated TS and HTML for calendar navigation and layout.")
