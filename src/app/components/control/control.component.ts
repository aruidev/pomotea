import { Component } from '@angular/core';
import { LucideAngularModule, PauseIcon, Play, Square } from 'lucide-angular';

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
}
