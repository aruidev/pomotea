import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, map, takeUntil, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService implements OnDestroy {
  // Storage keys
  private static readonly LS_TOTAL = 'pomotea.timer.totalSeconds';
  private static readonly LS_REMAINING = 'pomotea.timer.remainingSeconds';
  private static readonly LS_END_AT = 'pomotea.timer.endAt';
  private static readonly LS_STATE = 'pomotea.timer.state';

  // State
  private totalSeconds$ = new BehaviorSubject<number>(0);
  private remainingSeconds$ = new BehaviorSubject<number>(0);
  private state$ = new BehaviorSubject<'idle' | 'running' | 'paused'>('idle');
  private destroy$ = new Subject<void>();
  private tickerStop$ = new Subject<void>();

  // public observables
  readonly remaining$: Observable<number> = this.remainingSeconds$.asObservable();
  readonly total$: Observable<number> = this.totalSeconds$.asObservable();
  readonly percent$: Observable<number> = this.remainingSeconds$.pipe(
    map((r) => {
      const t = this.totalSeconds$.value;
      if (!t || t <= 0) return 0;
      const pct = (r / t) * 100;
      return Math.max(0, Math.min(100, Math.round(pct)));
    }),
    distinctUntilChanged()
  );
  readonly isRunning$: Observable<boolean> = this.state$.pipe(map((s) => s === 'running'), distinctUntilChanged());
  readonly isPaused$: Observable<boolean> = this.state$.pipe(map((s) => s === 'paused'), distinctUntilChanged());
  readonly isIdle$: Observable<boolean> = this.state$.pipe(map((s) => s === 'idle'), distinctUntilChanged());

  // snapshot getters
  get remainingSeconds(): number {
    return this.remainingSeconds$.value;
  }
  get totalSeconds(): number {
    return this.totalSeconds$.value;
  }
  get state(): 'idle' | 'running' | 'paused' {
    return this.state$.value;
  }

  constructor() {
    // attempt to hydrate from localStorage
    this.hydrateFromStorage();
    // if running, start ticker
    if (this.state === 'running') {
      this.startTicker();
    }
  }

  ngOnDestroy(): void {
    this.tickerStop$.next();
    this.tickerStop$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // API
  start(minutes: number): void {
    const mins = Math.max(0, Math.floor(minutes || 0));
    const total = mins * 60;
    if (total <= 0) {
      this.reset();
      return;
    }
    const endAt = Date.now() + total * 1000;
    this.totalSeconds$.next(total);
    this.remainingSeconds$.next(total);
    this.state$.next('running');
    this.persistToStorage({ totalSeconds: total, remainingSeconds: total, endAt, state: 'running' });
    this.startTicker();
  }

  pause(): void {
    if (this.state !== 'running') return;
    const endAt = this.readEndAt();
    const remaining = endAt ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000)) : this.remainingSeconds;
    this.remainingSeconds$.next(remaining);
    this.state$.next('paused');
    this.stopTicker();
    this.persistToStorage({ remainingSeconds: remaining, endAt: null, state: 'paused' });
  }

  resume(): void {
    if (this.state !== 'paused') return;
    if (this.remainingSeconds <= 0) {
      this.stop();
      return;
    }
    const endAt = Date.now() + this.remainingSeconds * 1000;
    this.state$.next('running');
    this.persistToStorage({ endAt, state: 'running' });
    this.startTicker();
  }

  stop(): void {
    this.reset();
  }

  // helpers
  private startTicker(): void {
    this.stopTicker();
    const endAt = this.readEndAt();
    // if endAt missing (e.g., resumed after hydration), compute from remaining
    const computedEndAt = endAt ?? Date.now() + this.remainingSeconds * 1000;
    this.writeEndAt(computedEndAt);
    interval(1000)
      .pipe(takeUntil(this.tickerStop$), takeUntil(this.destroy$))
      .subscribe(() => {
        const msLeft = computedEndAt - Date.now();
        const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
        if (secLeft !== this.remainingSeconds$.value) {
          this.remainingSeconds$.next(secLeft);
          this.persistToStorage({ remainingSeconds: secLeft });
        }
        if (secLeft <= 0) {
          this.reset();
        }
      });
  }

  private stopTicker(): void {
    this.tickerStop$.next();
  }

  private reset(): void {
    this.stopTicker();
    this.totalSeconds$.next(0);
    this.remainingSeconds$.next(0);
    this.state$.next('idle');
    this.clearStorage();
  }

  // storage persistence
  private hydrateFromStorage(): void {
    try {
      const total = Number(localStorage.getItem(TimerService.LS_TOTAL) || '0') || 0;
      const remaining = Number(localStorage.getItem(TimerService.LS_REMAINING) || '0') || 0;
      const endAtStr = localStorage.getItem(TimerService.LS_END_AT);
      const endAt = endAtStr ? Number(endAtStr) : null;
      const stateStr = (localStorage.getItem(TimerService.LS_STATE) as 'idle' | 'running' | 'paused' | null) || 'idle';

      if (stateStr === 'running' && endAt) {
        const secLeft = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        if (secLeft <= 0) {
          this.reset();
          return;
        }
        this.totalSeconds$.next(total);
        this.remainingSeconds$.next(secLeft);
        this.state$.next('running');
        // keep endAt as-is
      } else if (stateStr === 'paused' && remaining > 0 && total > 0) {
        this.totalSeconds$.next(total);
        this.remainingSeconds$.next(remaining);
        this.state$.next('paused');
      } else {
        this.reset();
      }
    } catch {
      // if storage not accessible, start fresh
      this.reset();
    }
  }

  private persistToStorage(partial: {
    totalSeconds?: number;
    remainingSeconds?: number;
    endAt?: number | null;
    state?: 'idle' | 'running' | 'paused';
  }): void {
    try {
      if (partial.totalSeconds !== undefined) localStorage.setItem(TimerService.LS_TOTAL, String(partial.totalSeconds));
      if (partial.remainingSeconds !== undefined)
        localStorage.setItem(TimerService.LS_REMAINING, String(partial.remainingSeconds));
      if (partial.endAt !== undefined) {
        if (partial.endAt === null) localStorage.removeItem(TimerService.LS_END_AT);
        else localStorage.setItem(TimerService.LS_END_AT, String(partial.endAt));
      }
      if (partial.state !== undefined) localStorage.setItem(TimerService.LS_STATE, partial.state);
    } catch {
      // ignore storage errors
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(TimerService.LS_TOTAL);
      localStorage.removeItem(TimerService.LS_REMAINING);
      localStorage.removeItem(TimerService.LS_END_AT);
      localStorage.removeItem(TimerService.LS_STATE);
    } catch {
      // ignore
    }
  }

  private readEndAt(): number | null {
    try {
      const s = localStorage.getItem(TimerService.LS_END_AT);
      return s ? Number(s) : null;
    } catch {
      return null;
    }
  }

  private writeEndAt(endAt: number): void {
    this.persistToStorage({ endAt });
  }
}
