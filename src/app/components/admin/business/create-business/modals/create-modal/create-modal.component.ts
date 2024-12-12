import { Component } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.css'
})
export class CreateModalComponent {
  constructor(public modalRef: MdbModalRef<CreateModalComponent>) {}
  formData = {
    name: '',
    location: '',
    description: '',
    contactNumber: '',
    photo: '',
    category: '',
  };

  close(): void {
    this.modalRef.close();
  }

  submitForm(): void {
    if (this.modalRef) {
      this.modalRef.close(this.formData); // Pass form data on close
    }
  }
}
