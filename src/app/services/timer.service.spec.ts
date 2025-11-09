import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerService } from './timer.service';

// Simple in-memory localStorage mock to isolate tests
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

describe('TimerService', () => {
  let service: TimerService;
  let ls: LocalStorageMock;

  beforeEach(() => {
    ls = new LocalStorageMock();
    (globalThis as any).localStorage = ls; // override
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
  });

  it('creates service', () => {
    expect(service).toBeTruthy();
    expect(service.state).toBe('idle');
  });

  it('starts countdown and decrements', fakeAsync(() => {
    service.start(1); // 1 minute
    expect(service.state).toBe('running');
    const initial = service.remainingSeconds;
    expect(initial).toBe(60);
    tick(1000);
    // After 1s should be <=59
    expect(service.remainingSeconds).toBeLessThan(initial);
  }));

  it('pauses and resumes preserving remaining time', fakeAsync(() => {
    service.start(1);
    tick(2000); // 2 seconds pass
    const after2s = service.remainingSeconds;
    service.pause();
    expect(service.state).toBe('paused');
    tick(3000); // paused time should not decrement
    expect(service.remainingSeconds).toBe(after2s);
    service.resume();
    expect(service.state).toBe('running');
    tick(1000);
    expect(service.remainingSeconds).toBeLessThan(after2s);
  }));

  it('stops and resets state', fakeAsync(() => {
    service.start(1);
    service.stop();
    expect(service.state).toBe('idle');
    expect(service.remainingSeconds).toBe(0);
  }));
});
