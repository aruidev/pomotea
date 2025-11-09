import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-timer',
  imports: [AsyncPipe],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  constructor(public timer: TimerService) {}

  get formatted$() {
    return this.timer.remaining$.pipe(map((seconds) => TimerComponent.formatSeconds(seconds)));
  }

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
