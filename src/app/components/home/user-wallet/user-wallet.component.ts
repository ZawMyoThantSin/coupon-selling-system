import { Component } from '@angular/core';

@Component({
  selector: 'app-user-wallet',
  standalone: true,
  imports: [],
  templateUrl: './user-wallet.component.html',
  styleUrl: './user-wallet.component.scss'
})
export class UserWalletComponent {
  transactions = [
    { name: 'Jenny Wilson', initials: 'JW', amount: -438 },
    { name: 'Wade Warren', initials: 'WW', amount: 1200 },
    { name: 'Cameron Williamson', initials: 'CW', amount: 786 }
  ];
}
