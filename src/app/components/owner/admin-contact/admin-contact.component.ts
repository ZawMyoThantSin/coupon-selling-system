import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [],
  templateUrl: './admin-contact.component.html',
  styleUrl: './admin-contact.component.css'
})
export class AdminContactComponent {

  constructor(private router: Router){}

  navigateTo():void{
    this.router.navigate(['o/admin-message'])
  }

}
