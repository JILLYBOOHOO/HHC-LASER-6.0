import os
import re

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\shared\components\weekly-calendar\weekly-calendar.component.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_card_html = """
            <ng-template #appointmentTpl>
              <div class="flex flex-col h-full font-sans text-slate-800">
                <!-- Time -->
                <div class="font-bold text-[10px] mb-0.5 opacity-90">{{ ev.startTime.substring(0, 5) }}</div>
                
                <!-- Patient Name -->
                <div class="font-extrabold text-[11px] truncate leading-tight">{{ ev.patient || 'Patient' }}</div>
                
                <!-- Service -->
                <div class="flex items-center gap-1 mt-1 truncate text-[10px] font-medium opacity-90">
                  <span class="text-[10px] shrink-0">{{ getServiceIcon(ev.title) }}</span>
                  <span class="truncate">{{ ev.title }}</span>
                </div>
                
                <!-- Duration -->
                <div class="flex items-center gap-1 mt-0.5 truncate text-[10px] font-medium opacity-90">
                  <mat-icon class="!text-[12px] !w-3 !h-3 shrink-0" style="font-size: 12px; width: 12px; height: 12px; line-height: 12px; margin-top: -2px;">schedule</mat-icon>
                  <span class="shrink-0">{{ ev.durationMinutes }}m</span>
                </div>
                
                <!-- Status / Payment -->
                <div class="mt-auto pt-1 flex items-center gap-1 text-[9.5px] font-bold tracking-wide overflow-hidden" *ngIf="ev.durationMinutes >= 30">
                  <ng-container *ngIf="ev.status === 'confirmed'">
                    <span *ngIf="ev.paymentStatus === 'Paid Online'" class="flex items-center gap-1"><span class="text-[10px]">💳</span> Deposit Paid</span>
                    <span *ngIf="ev.paymentStatus === 'Paid In Store'" class="flex items-center gap-1"><span class="text-[10px]">💳</span> Paid</span>
                    <span *ngIf="ev.paymentStatus === 'Balance Due' || ev.paymentStatus === 'unpaid'" class="flex items-center gap-1"><span class="text-[10px]">💳</span> Balance Due</span>
                  </ng-container>
                  
                  <ng-container *ngIf="ev.status === 'checked_in'">
                    <span class="flex items-center gap-1"><span class="text-[10px]">✅</span> Checked In</span>
                  </ng-container>

                  <ng-container *ngIf="ev.status === 'in_treatment'">
                    <span class="flex items-center gap-1"><span class="text-[10px]">⏳</span> In Treatment</span>
                  </ng-container>

                  <ng-container *ngIf="ev.status === 'completed'">
                    <span class="flex items-center gap-1"><span class="text-[10px]">✅</span> Completed</span>
                  </ng-container>

                  <ng-container *ngIf="ev.status === 'cancelled'">
                    <span class="flex items-center gap-1"><span class="text-[10px]">❌</span> Cancelled</span>
                  </ng-container>
                  
                  <ng-container *ngIf="ev.status === 'no_show'">
                    <span class="flex items-center gap-1"><span class="text-[10px]">🚫</span> No Show</span>
                  </ng-container>
                </div>
              </div>
            </ng-template>
"""

content = re.sub(
    r"<ng-template #appointmentTpl>.*?</ng-template>",
    new_card_html,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
