import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template:`
  <div class="not-found-container">
  <h1 class="not-found-title">404</h1>
  <p class="not-found-message">We couldn't find the page you're looking for.</p>
  <a class="not-found-link" routerLink="/">Go Back Home</a>
</div>


  `,
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

}
