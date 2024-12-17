import { Component } from '@angular/core';
import { Product } from '../../../../models/product';
import { ProductService } from '../../../../services/product/product.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent {
  
products:Product[]=[];
constructor(private service:ProductService,private router: Router){}
}
