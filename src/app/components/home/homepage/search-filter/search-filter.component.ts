import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.css'],
})
export class SearchFilterComponent {
  searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();

  onSearch(): void {
    this.searchTermChange.emit(this.searchTerm.trim().toLowerCase());
  }
}
