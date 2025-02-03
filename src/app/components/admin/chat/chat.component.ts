import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer/customer.service';
import { Customer } from '../../../models/customer';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';

interface ChatUser {
  id: number;
  name: string;
  email: string;
  profile: string | null;
  lastActive: Date;
  status: 'online' | 'offline';
  role: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  users: Customer[] = [];
  filteredUsers: Customer[] = [];
  searchTerm: string = '';
  selectedRole: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 4;

  constructor(private router: Router,
              private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe((data: any) => {
      this.users = data.filter((customer: Customer) => customer.role.toLowerCase() === 'owner');
      this.filteredUsers = this.users.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      console.log('Filtered Owners:', this.filteredUsers);
    });
    this.filterUsers();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      (!this.searchTerm || user.name.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.selectedRole || user.role === this.selectedRole)
    );
  }

  filterByName() {
    this.filterUsers();
  }

  startChat(userId: number): void {
    this.router.navigate(['d/owner-message', userId]);
  }

  get uniqueRoles(): string[] {
    return [...new Set(this.users.map(user => user.role))];
  }

  getImageUrl(profile: string) {
    return profile.startsWith('http') ? profile : `/uploads/${profile}`;
  }
}
