import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-selector',
  imports: [],
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.css',
})
export class ThemeSelectorComponent implements OnInit {

  selectedTheme = 'tea';

  ngOnInit(): void {
    const theme = this.getLocalTheme();
    this.setTheme(theme);
  }

  getTheme() {
    return this.selectedTheme;
  }

  getLocalTheme() {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? storedTheme : 'tea';
  }

  setTheme(themeName: string) {
    this.selectedTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }
}
