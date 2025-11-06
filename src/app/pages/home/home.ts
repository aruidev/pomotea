import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/layout/header/header.component';
import { FooterComponent } from '../../components/layout/footer/footer.component';
import { CupComponent } from '../../components/cup/cup.component';
import { TimerComponent } from '../../components/timer/timer.component';
import { ControlComponent } from '../../components/control/control.component';


@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent, CupComponent, TimerComponent, ControlComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
