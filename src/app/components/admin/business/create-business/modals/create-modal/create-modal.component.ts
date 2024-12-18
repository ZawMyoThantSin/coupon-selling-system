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
  formData = {
    name: '',
    location: '',
    description: '',
    contactNumber: '',
    category: '',
  };

  selectedFile: File | null = null; // For the uploaded file

  constructor(public modalRef: MdbModalRef<CreateModalComponent>) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      console.log("No file selected.");
    }
  }

  close(): void {
    this.modalRef.close();
  }

  submitForm(): void {

    if (this.modalRef) {
      const formData = new FormData();
      formData.append('name', this.formData.name);
      formData.append('location', this.formData.location);
      formData.append('description', this.formData.description);
      formData.append('contactNumber', this.formData.contactNumber);
      formData.append('category', this.formData.category);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      this.modalRef.close(formData); // Pass FormData to the parent
    }
  }
}

