import { Component } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-theme-selector',
  imports: [NgbAccordionModule],
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.css',
})
export class ThemeSelectorComponent {
  selectedTheme = ''; // o 'tea' por defecto

  setTheme(themeName: string) {
    this.selectedTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
  }
}
