import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface BusinessSettings {
  business_name?: string;
  logo_url?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagram_url?: string;
  facebook_url?: string;
  google_oauth_client_id?: string;
  google_oauth_client_secret?: string;
  google_oauth_status?: string;
  google_oauth_mode?: string;
  google_oauth_allowed_domains?: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  
  settings = signal<BusinessSettings>({
    business_name: 'HHC Laser & Co',
    tagline: 'Jamaica\'s trusted destination for advanced laser treatments',
    email: 'infohhcLaser@gmail.com',
    phone: '(876) 319-6241',
    address: '48 Constant Spring Road, Kingston, Jamaica',
    google_oauth_status: 'disabled',
  }); // Default fallback values

  loadSettings() {
    this.http.get<{success: boolean, data: BusinessSettings}>(`${environment.apiUrl}/settings/business`)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            // Merge loaded settings with defaults, ignoring empty strings
            const merged = { ...this.settings() };
            for (const [key, val] of Object.entries(res.data)) {
              if (val) merged[key as keyof BusinessSettings] = val;
            }
            this.settings.set(merged);
          }
        }
      });
  }
}
