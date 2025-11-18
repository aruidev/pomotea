import { Component, Signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { TimerService } from '../../services/timer.service';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-timer',
  imports: [FormsModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  constructor(public timer: TimerService, private title: Title) {
    this.baseTitle = this.title.getTitle() || 'Pomotea';
    this.remaining = toSignal(this.timer.remaining$, { initialValue: this.timer.remainingSeconds });
    this.isRunning = toSignal(this.timer.isRunning$, { initialValue: this.timer.state === 'running' });
    this.isPaused = toSignal(this.timer.isPaused$, { initialValue: this.timer.state === 'paused' });
    this.formatted = computed(() => TimerComponent.formatSeconds(this.remaining()));

    effect(() => {
      const running = this.isRunning();
      const paused = this.isPaused();
      const formatted = this.formatted();
      if (running) {
        this.title.setTitle(`${formatted} · Pomotea`);
      } else if (paused) {
        this.title.setTitle(`Paused: ${formatted} · Pomotea`);
      } else {
        this.title.setTitle(this.baseTitle);
      }
    });
  }

  private baseTitle = 'Pomotea';
  remaining!: Signal<number>;
  isRunning!: Signal<boolean>;
  isPaused!: Signal<boolean>;
  formatted!: Signal<string>;

  private static formatSeconds(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds || 0));
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
