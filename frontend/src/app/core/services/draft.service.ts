import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, BookingDraft, SaveDraftDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private readonly api = `${environment.apiUrl}/drafts`;

  /** In-memory signal — consumers can read this reactively without re-fetching */
  readonly draft = signal<BookingDraft | null>(null);

  constructor(private http: HttpClient) {}

  // ─── Load ────────────────────────────────────────────────────────────────────
  /** Fetch the user's current draft. Returns null if none exists. */
  loadDraft(): Observable<BookingDraft | null> {
    return this.http.get<ApiResponse<BookingDraft>>(`${this.api}`).pipe(
      tap(res => this.draft.set(res.data ?? null)),
      catchError(err => {
        // 404 means no draft → not a real error
        if (err.status === 404) {
          this.draft.set(null);
          return of(null as any);
        }
        throw err;
      })
    );
  }

  // ─── Save / Update ───────────────────────────────────────────────────────────
  /** Upsert the draft with a partial update. */
  saveDraft(dto: SaveDraftDto): Observable<BookingDraft> {
    return this.http.post<ApiResponse<BookingDraft>>(`${this.api}`, dto).pipe(
      tap(res => this.draft.set(res.data ?? null)),
      map(res => res.data!),
      catchError(err => {
        console.error('[DraftService] saveDraft error', err);
        throw err;
      })
    );
  }

  // ─── Dismiss ─────────────────────────────────────────────────────────────────
  /** Mark the resume prompt as dismissed so it won't appear again for this draft. */
  dismissPrompt(): Observable<any> {
    return this.http.patch(`${this.api}/dismiss`, {}).pipe(
      tap(() => {
        const current = this.draft();
        if (current) {
          this.draft.set({ ...current, resume_prompt_dismissed: true });
        }
      }),
      catchError(err => {
        console.error('[DraftService] dismissPrompt error', err);
        throw err;
      })
    );
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  /** Remove the draft entirely, e.g. after the booking is confirmed. */
  deleteDraft(): Observable<any> {
    return this.http.delete(`${this.api}`).pipe(
      tap(() => this.draft.set(null)),
      catchError(err => {
        console.error('[DraftService] deleteDraft error', err);
        throw err;
      })
    );
  }
}
