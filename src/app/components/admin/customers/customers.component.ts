import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../models/customer';
import { RouterLink } from '@angular/router';
import SimpleDatatables from 'simple-datatables';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {
  fund:any;
  customers:Customer[]= [];
  editMode: number | null = null; // Track the ID of the row being edited




  constructor(private customerService: CustomerService,
              private toastr: ToastrService
  ){}
  ngOnInit(): void {
    this.customerService.getCustomers().subscribe((data:any) =>  {
      this.fund = data.funds
      this.customers = data;
    });
  }
  editFunds(item: any) {
    this.editMode = item.id; // Set the edit mode for the specific item by ID
  }

  saveFunds(item: any) {
    this.editMode = null; // Exit edit mode
    const partialUpdate = {
      id: item.id,      // Include the user ID
      fund: this.fund   // Include only the updated fund value
    };

    // console.log('Funds updated:', partialUpdate);

    this.customerService.editUserFund(partialUpdate).subscribe(
      (res) => {
        // console.log("Update successful:", res);
        // Update the local customer data with the new fund value
        this.toastr.success("Updated Successfully...","Success");
        const customer = this.customers.find(c => c.id === item.id);
        if (customer) {
          customer.funds = this.fund;
        }
      },
      (error) => {
        this.toastr.error("Error In Update...","Error");
        console.log("Error updating fund:", error)}
    );
  }


  cancelEdit(item: any) {
    this.editMode = null; // Disable edit mode
    // Optionally reset the fund value if needed
    this.fund = item.funds; // Reset the field to the original value
  }

  getImageUrl(path:any){

  }
}
