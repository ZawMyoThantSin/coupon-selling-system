import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';


@Component({
  selector: 'app-aboutus',
  standalone: true,
  imports: [CommonModule, MdbRippleModule],
  templateUrl: './aboutus.component.html',
  styleUrl: './aboutus.component.css'
})
export class AboutusComponent {

}
