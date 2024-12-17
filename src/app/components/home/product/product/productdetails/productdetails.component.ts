import { Component } from '@angular/core';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  standalone:true,
  imports:[FormsModule,CommonModule],
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css'
})
export class ProductdetailsComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProductService
  ) {}

    product:any;
    quantity: number = 1;

    ngOnInit(): void {
      const productId = this.route.snapshot.params['id'];
      this.service.getProductById(productId).subscribe((data) => {
        this.product = data;
      });
    }
    addToCart(){
      console.log(`Added ${this.quantity} item(s) to the cart.`);
    alert(`You added ${this.quantity} item(s) to the cart.`);
    }
    goBack(){
      this.router.navigate(['/homepage/c']);
    }
}
