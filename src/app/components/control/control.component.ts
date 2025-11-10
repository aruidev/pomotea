import { Component } from '@angular/core';
import { LucideAngularModule, PauseIcon, Play, Square } from 'lucide-angular';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-control',
  imports: [LucideAngularModule],
  templateUrl: './control.component.html',
  styleUrl: './control.component.css',
})
export class ControlComponent {
  readonly PlayIcon = Play;
  readonly PauseIcon = PauseIcon;
  readonly StopIcon = Square;

  constructor(public timer: TimerService) {}

  startTimer() {
    // Request OS notification permission on user gesture
    this.timer.requestNotificationPermission();
    this.timer.start(this.timer.focusMinutes);
  }

  pauseTimer() {
    this.timer.pause();
  }

  resumeTimer() {
    this.timer.resume();
  }

  stopTimer() {
    this.timer.stop();
  }
}
