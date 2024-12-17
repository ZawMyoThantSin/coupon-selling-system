import { Component } from '@angular/core';
import { Product } from '../../../../models/product';
import { ProductService } from '../../../../services/product/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  products:Product[]=[];
filteredProducts: Product[] = [];
searchQuery: string = '';
constructor(private service:ProductService,private router: Router){}
  ngOnInit(){
    this.service.getAllProducts().subscribe(
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
  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      // Filter products by name matching the search query
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(query)
      );
    } else {
      // Reset to show all products if the search query is empty
      this.filteredProducts = [...this.products];
    }
  }
  }

