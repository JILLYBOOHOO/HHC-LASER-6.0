import os

def update_ts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add new properties
    insert = """
  zoomLevel: number = 100;
  locations = ['All Locations', 'HHC LASER Kingston', 'Constant Spring'];
  currentLocationIdx = 0;
  activeView = 'week';

  get currentLocation(): string {
    return this.locations[this.currentLocationIdx];
  }

  toggleLocation() {
    this.currentLocationIdx = (this.currentLocationIdx + 1) % this.locations.length;
  }

  zoomIn() {
    if (this.zoomLevel < 200) this.zoomLevel += 10;
  }

  zoomOut() {
    if (this.zoomLevel > 50) this.zoomLevel -= 10;
  }

  setView(view: string) {
    this.activeView = view;
  }

  get currentMonthYear(): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }
"""
    
    if 'zoomLevel: number =' not in content:
        class_idx = content.find('{', content.find('export class ')) + 1
        content = content[:class_idx] + insert + content[class_idx:]
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix location button
    content = content.replace(
        '<span>All Locations</span>',
        '<span>{{ currentLocation }}</span>'
    )
    content = content.replace(
        '<div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors">',
        '<div (click)="toggleLocation()" class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors">'
    )

    # 2. Change Amanda to Admin and remove image
    amanda_block = """<div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors">
        <div class="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] text-blue-700">A</div>
        <span>Amanda</span>
      </div>"""
    admin_block = """<div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors">
        <span>Admin</span>
      </div>"""
    content = content.replace(amanda_block, admin_block)

    # 3. Mini calendar nav
    content = content.replace(
        '<div class="text-sm font-extrabold tracking-tight">May 2025</div>',
        '<div class="text-sm font-extrabold tracking-tight">{{ currentMonthYear }}</div>'
    )
    
    # We have multiple chevrons, let's just replace them based on their surrounding context
    # Left sidebar mini calendar chevrons
    content = content.replace(
        '<button class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-[18px]">chevron_left</mat-icon></button>',
        '<button (click)="previousWeek()" class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-[18px]">chevron_left</mat-icon></button>'
    )
    content = content.replace(
        '<button class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-[18px]">chevron_right</mat-icon></button>',
        '<button (click)="nextWeek()" class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-[18px]">chevron_right</mat-icon></button>'
    )

    # 4. View toggles (Day/Week/Month)
    day_btn = '<button class="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Day</button>'
    week_btn = '<button class="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm transition-colors">Week</button>'
    month_btn = '<button class="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Month</button>'
    
    content = content.replace(
        day_btn,
        '<button (click)="setView(\'day\')" [ngClass]="activeView === \'day\' ? \'font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm\' : \'font-bold text-slate-600 hover:text-slate-900\'" class="px-4 py-1.5 rounded-lg text-xs transition-colors">Day</button>'
    )
    content = content.replace(
        week_btn,
        '<button (click)="setView(\'week\')" [ngClass]="activeView === \'week\' ? \'font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm\' : \'font-bold text-slate-600 hover:text-slate-900\'" class="px-4 py-1.5 rounded-lg text-xs transition-colors">Week</button>'
    )
    content = content.replace(
        month_btn,
        '<button (click)="setView(\'month\')" [ngClass]="activeView === \'month\' ? \'font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm\' : \'font-bold text-slate-600 hover:text-slate-900\'" class="px-4 py-1.5 rounded-lg text-xs transition-colors">Month</button>'
    )

    # 5. Zoom controls
    content = content.replace(
        '<button class="px-3 py-1.5 hover:bg-slate-50 transition-colors border-r border-slate-200 flex items-center gap-1"><mat-icon class="!text-[14px]">remove</mat-icon> Zoom</button>',
        '<button (click)="zoomOut()" class="px-3 py-1.5 hover:bg-slate-50 transition-colors border-r border-slate-200 flex items-center gap-1"><mat-icon class="!text-[14px]">remove</mat-icon> Zoom</button>'
    )
    content = content.replace(
        '<button class="px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1"><mat-icon class="!text-[14px]">add</mat-icon> Zoom</button>',
        '<button (click)="zoomIn()" class="px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1"><mat-icon class="!text-[14px]">add</mat-icon> Zoom</button>'
    )
    content = content.replace(
        '<div class="px-3 py-1.5 border-r border-slate-200">100%</div>',
        '<div class="px-3 py-1.5 border-r border-slate-200">{{ zoomLevel }}%</div>'
    )

    # 6. Apply zoom and min-width to calendar
    content = content.replace(
        '<app-weekly-calendar [startDate]="currentDate"',
        '<div class="min-w-[700px] h-full" [style.zoom]="zoomLevel / 100"><app-weekly-calendar [startDate]="currentDate"'
    )
    # close the div right after the app-weekly-calendar tag
    content = content.replace(
        '(eventClick)="openReschedule($event)"></app-weekly-calendar>',
        '(eventClick)="openReschedule($event)"></app-weekly-calendar></div>'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

admin_ts = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\bookings\admin-bookings.component.ts"
admin_html = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\bookings\admin-bookings.component.html"
staff_ts = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\employee\schedule\employee-schedule.component.ts"
staff_html = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\employee\schedule\employee-schedule.component.html"

update_ts(admin_ts)
update_html(admin_html)
update_ts(staff_ts)
update_html(staff_html)

print("UI fixes applied.")
