import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cup',
  imports: [],
  templateUrl: './cup.component.html',
  styleUrl: './cup.component.css',
})
export class CupComponent {
  // Percentage filled [0, 100]. You can set this from a parent or a service.
  @Input() fillPercent = 100;

  // Computed 'y' for the clipping rect in the 200x200 viewBox.
  get liquidY(): number {
    const clamped = Math.max(0, Math.min(100, this.fillPercent));
    // Cup interior visual bounds (tuned to match perceived edges)
    const topY = 55;      // geometric rim
    const bottomY = 155;  // geometric base
    const topOffset = 3;  // hide last 2px under rim
    const bottomOffset = 1; // ignore bottom 2px where barely visible
    const visualTop = topY + topOffset;
    const visualBottom = bottomY - bottomOffset;
    const height = visualBottom - visualTop; // 96
    // 0% => y = visualBottom (empty), 100% => y = visualTop (full)
    return Math.round(visualBottom - (clamped / 100) * height);
  }

  // Expose height for the clip rect binding
  get cupHeight(): number {
    const topOffset = 2;
    const bottomOffset = 2;
    return (155 - bottomOffset) - (55 + topOffset);
  }

}