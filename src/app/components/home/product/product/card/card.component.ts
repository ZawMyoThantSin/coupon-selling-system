import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../../services/product/product.service';
import { Product } from '../../../../../models/product';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonEngine } from '@angular/ssr';
import { CommonModule } from '@angular/common';
@Component({
  standalone:true,
  imports:[FormsModule, CommonModule],
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit{

products:Product[]=[];
filteredProducts: Product[] = [];
searchQuery: string = '';
alphabet: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
constructor(private service:ProductService,private router: Router){}


ngOnInit(){
  this.service.getAllProducts(1).subscribe(
    (data) => {
      console.log("Products data:", data);
      this.products = data; // Assign fetched data to products
      this.filteredProducts = [...this.products];
    },
    (error) => {
      console.error("Error fetching products:", error);
    }
  );
}
viewProductDetails(id: number) {
  this.router.navigate(['/homepage/p', id]);
}
// filterProducts(query: string): void {
//   this.filteredProducts = this.products.filter(product =>
//     product.name.toLowerCase().includes(query.toLowerCase())
//   );
// }
filterProducts(): void {
  const query = this.searchQuery.trim().toLowerCase();
  if (query) {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  } else {
    this.filteredProducts = [...this.products];
  }
}
filterByCharacter(char: string): void {
  this.filteredProducts = this.products.filter(product =>
    product.name.toLowerCase().startsWith(char.toLowerCase())
  );
}

getImageUrl(imagePath: string): any {
  return this.service.getImageUrl(imagePath);
}
// onSearch(): void {
//   const query = this.searchQuery.trim().toLowerCase();
//   if (query) {
//     // Filter products by name matching the search query
//     this.filteredProducts = this.products.filter(product =>
//       product.name.toLowerCase().includes(query)
//     );
//   } else {
//     // Reset to show all products if the search query is empty
//     this.filteredProducts = [...this.products];
//   }
}

  // deselectProduct(event: MouseEvent): void {
  //   event.stopPropagation(); // Prevent card click from re-triggering selection
  //   this.selectedProduct = null;
  // }


