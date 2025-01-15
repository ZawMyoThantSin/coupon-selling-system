import { Component } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';

@Component({
  selector: 'app-delete-category-modal',
  standalone: true,
  imports: [],
  template: `
     <div class="modal-header">
      <h5 class="modal-title">Confirm Deletion</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="close(false)"></button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to delete this category?</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="close(false)">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="close(true)">Delete</button>
    </div>
  `,
  styleUrl: './delete-category-modal.component.css'
})
export class DeleteCategoryModalComponent {
  constructor(public modalRef: MdbModalRef<DeleteCategoryModalComponent>) {}

  close(confirm: boolean): void {
    this.modalRef.close(confirm);
  }
}
