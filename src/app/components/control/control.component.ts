import { Component } from '@angular/core';
import { LucideAngularModule, PauseIcon, Play, Square } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-control',
  imports: [LucideAngularModule, FormsModule],
  templateUrl: './control.component.html',
  styleUrl: './control.component.css',
})
export class ControlComponent {
  readonly PlayIcon = Play;
  readonly PauseIcon = PauseIcon;
  readonly StopIcon = Square;
  minutesInput = 25; // default focus duration

  constructor(public timer: TimerService) {}

  startTimer() {
    this.timer.start(this.minutesInput);
  }

  pauseTimer() {
    this.timer.pause();
  }

  resumeTimer() {
    this.timer.resume();
  }

  stopTimer() {
    this.timer.stop();
    // keep previous minutes input for convenience; optionally reset
  }
}
