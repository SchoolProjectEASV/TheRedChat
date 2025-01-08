import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../services/encryption.service';

@Component({
  selector: 'app-keyinputdialog',
  standalone: true,
  imports: [FormsModule, CommonModule],  // Add these
  templateUrl: './keyinputdialog.component.html',
  styleUrl: './keyinputdialog.component.css'
})
export class KeyInputDialogComponent {
  @Output() keySubmitted = new EventEmitter<void>();
  
  privateKey = '';
  error = '';

  constructor(private encryptionService: EncryptionService) {}

  async handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      this.privateKey = text.trim();
    } catch (error) {
      this.error = 'Failed to read key file';
    }
  }

  async submitKey() {
    if (!this.privateKey) return;

    try {
      const success = await this.encryptionService.initializeWithPrivateKey(this.privateKey);
      if (success) {
        this.keySubmitted.emit();
      } else {
        this.error = 'Invalid private key';
      }
    } catch (error) {
      this.error = 'Failed to initialize with private key';
    }
  }
}
