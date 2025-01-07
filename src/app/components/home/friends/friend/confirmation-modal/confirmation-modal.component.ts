import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  @Input() show: boolean = false; // Flag to control modal visibility
  @Input() title: string = ''; // Title of the confirmation
  @Input() message: string = ''; // Message of the confirmation
  @Output() confirmed: EventEmitter<void> = new EventEmitter(); // Event to emit on confirmation
  @Output() canceled: EventEmitter<void> = new EventEmitter(); // Event to emit on cancellation

  confirm() {
    this.confirmed.emit(); // Emit confirmation event
    this.close(); // Close the modal after confirmation
  }

  cancel() {
    this.canceled.emit(); // Emit cancellation event
    this.close(); // Close the modal after cancellation
  }

  private close() {
    this.show = false; // Close the modal
  }
}
