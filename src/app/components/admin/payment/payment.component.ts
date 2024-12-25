import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { PaymentCreateComponent } from "./payment-create/payment-create.component";
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [MdbTabsModule, CommonModule,RouterLink,RouterOutlet],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class PaymentComponent {


}
