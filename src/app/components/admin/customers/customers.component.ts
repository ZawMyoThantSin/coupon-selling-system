import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../models/customer';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  uniqueRoles: string[] = [];
  selectedRole: string = '';
  searchTerm: string = '';
  currentPage: number = 1;
  fund: any;
  editMode: number | null = null; // Track the ID of the row being edited

  constructor(
    private customerService: CustomerService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe((data: any) => {
      this.customers = data;
      this.filteredCustomers = this.customers; // Initialize with all customers
      this.uniqueRoles = [...new Set(this.customers.map((c) => c.role))]; // Get unique roles
    });
  }

  filterByRole(): void {
    const roleFiltered = this.selectedRole
      ? this.customers.filter((customer) => customer.role === this.selectedRole)
      : this.customers;

    this.filteredCustomers = this.searchTerm
      ? roleFiltered.filter((customer) =>
          customer.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : roleFiltered;
  }
  filterByName(): void {
    // Filter customers based on the search term
    if (this.searchTerm) {
      this.filteredCustomers = this.customers.filter((customer) =>
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredCustomers = this.customers; // Show all if search term is empty
    }

    // Apply role filter if selected
    if (this.selectedRole) {
      this.filteredCustomers = this.filteredCustomers.filter(
        (customer) => customer.role === this.selectedRole
      );
    }
  }
  editFunds(item: any) {
    this.editMode = item.id; // Set the edit mode for the specific item by ID
    this.fund = item.funds; // Load the current fund value for editing
  }

  saveFunds(item: any) {
    this.editMode = null; // Exit edit mode
    const partialUpdate = {
      id: item.id,
      fund: this.fund
    };

    this.customerService.editUserFund(partialUpdate).subscribe(
      () => {
        this.toastr.success('Funds updated successfully.', 'Success');
        const customer = this.customers.find((c) => c.id === item.id);
        if (customer) {
          customer.funds = this.fund;
        }
      },
      (error) => {
        this.toastr.error('Error updating funds.', 'Error');
        console.error('Error updating funds:', error);
      }
    );
  }

  cancelEdit() {
    this.editMode = null; // Disable edit mode
    this.fund = null; // Reset the fund value
  }

  getImageUrl(image: any): string {
    return this.userService.getImageUrl(image);
  }

}
