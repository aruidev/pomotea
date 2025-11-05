import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/layout/header/header.component';
import { FooterComponent } from '../../components/layout/footer/footer.component';
import { CupComponent } from '../../components/cup/cup.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent, CupComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
