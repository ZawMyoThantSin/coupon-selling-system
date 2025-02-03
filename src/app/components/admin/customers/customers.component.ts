import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../models/customer';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../services/user/user.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
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
  modalRef1: MdbModalRef<AddAdminComponent> | null = null;
  userId:any;
  token:any;
  isSystemAdmin: boolean = false;
  showError: boolean = false;

  constructor(
    private customerService: CustomerService,
    private userService: UserService,
    private toastr: ToastrService,
    private modalService: MdbModalService,
    private storageService: StorageService,
    private jwtService: JwtService
  ) {}


  ngOnInit(): void {
    this.token = this.storageService.getItem("token");
    this.userId = this.jwtService.getUserId(this.token);
    this.isSystemAdmin = this.userId === 1;
    this.customerService.getCustomers().subscribe((data: any) => {
      this.customers = data;
      this.filteredCustomers = this.customers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

       console.log(this.filteredCustomers);
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

  getImageUrl(image: any): string {
    return this.userService.getImageUrl(image);

  }

  exportAsPDF(): void {
    const filteredData = this.filteredCustomers;
    if (filteredData.length === 0) {
      this.toastr.warning("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Customers Report", 10, 10);

    const tableData = filteredData.map((customer, index) => [
      index + 1,
      customer.name,
      customer.role,
      customer.email,
      customer.created_at,
    ]);

    (doc as any).autoTable({
      head: [["#", "Name", "Role", "Email", "Created At"]],
      body: tableData,
    });

    doc.save("customers.pdf");
  }


  exportAsExcel(): void {
    const filteredData = this.filteredCustomers;
    if (filteredData.length === 0) {
      this.toastr.warning("No data available to export.");
      return;
    }

    // Convert filtered data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((customer, index) => ({
        "#": index + 1,
        "Name": customer.name,
        "Role": customer.role,
        "Email": customer.email,
        "Created At": customer.created_at,
      }))
    );

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob and trigger download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "customers.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openUserModal(): void {
    if (!this.isSystemAdmin) {
      this.showError = true; // Show the error alert
    setTimeout(() => this.showError = false, 5000); // Auto-hide after 3 seconds
    return;
    }
          this.modalRef1 = this.modalService.open(AddAdminComponent, {
            modalClass: 'modal-md',// Optional: specify modal size (e.g., 'modal-sm', 'modal-lg')
          });

          this.modalRef1.onClose.subscribe((data) => {
            if (data) {
              const requestData = {
                ...data, // Spread existing form data
              };
              console.log('Form submitted:', requestData);
              this.customerService.addAdmin(this.userId, requestData).subscribe(
                  response => {
                    console.log("Server Response: ", response);
                    // Toastr success alert
                    this.toastr.success('Admin created successfully!', 'Success');
                    this.ngOnInit();
                  },
                  error => {
                    console.error("Error In Admin Create: ",error)
                  }
              )


            }
          });
        }
}
