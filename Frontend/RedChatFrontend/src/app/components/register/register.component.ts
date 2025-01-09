import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  isRegistering = false;
  isGeneratingKeys = false;
  errorMessage = '';
  passwordErrors: string[] = [];
  showKeyBackup = false;
  privateKey = '';
  hasBackedUpKey = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getButtonText(): string {
    if (this.isGeneratingKeys) {
      return 'Generating Keys...';
    }
    if (this.isRegistering) {
      return 'Creating Account...';
    }
    return 'Register';
  }

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.validatePassword(this.password)) {
      this.errorMessage = this.passwordErrors.join(' ');
      return;
    }

    try {
      const existingUsernames = await firstValueFrom(this.authService.getAllUsernames());

      if (existingUsernames && existingUsernames.includes(this.username)) {
        this.errorMessage = 'Username is already taken. Please choose another one.';
        return;
      }
    } catch (error) {
      this.errorMessage = 'Error checking username availability. Please try again.';
      return;
    }

    this.isRegistering = true;
    this.errorMessage = '';

    try {
      this.authService.register(this.username, this.password).subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          
          if (response.status === 'generating-keys') {
            this.isGeneratingKeys = true;
          } else if (response.status === 'complete') {
            this.isGeneratingKeys = false;
            this.privateKey = response.data.privateKey;
            this.showKeyBackup = true;
            this.isRegistering = false;
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.isRegistering = false;
          this.isGeneratingKeys = false;
        }
      });
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      this.isRegistering = false;
      this.isGeneratingKeys = false;
    }
}

  validatePassword(password: string): boolean {
    this.passwordErrors = [];

    if (password.length < 6) {
      this.passwordErrors.push('Password must be at least 6 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      this.passwordErrors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      this.passwordErrors.push('Password must contain at least one lowercase letter.');
    }
    if (!/\d/.test(password)) {
      this.passwordErrors.push('Password must contain at least one digit.');
    }

    return this.passwordErrors.length === 0;
  }

  downloadPrivateKey() {
    const blob = new Blob([this.privateKey], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private-key-${this.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.privateKey);
      alert('Private key copied to clipboard');
    } catch (error) {
      alert('Failed to copy to clipboard. Please use the download button instead');
    }
  }

  continueToLogin() {
    if (!this.hasBackedUpKey) {
      alert('Please confirm that you have backed up your private key.');
      return;
    }

    this.privateKey = '';
    this.password = '';
    this.confirmPassword = '';

    this.router.navigate(['/login']);
  }
}