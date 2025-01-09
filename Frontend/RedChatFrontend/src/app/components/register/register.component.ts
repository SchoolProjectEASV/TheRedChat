import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 

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
  errorMessage = '';
  showKeyBackup = false;
  privateKey = '';
  hasBackedUpKey = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isRegistering = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.register(
        this.username, 
        this.password
      ).toPromise();

      this.privateKey = response.privateKey;
      this.showKeyBackup = true;
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
    } finally {
      this.isRegistering = false;
    }
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
      alert('Failed to copy to clipboard. Please use the download button instead.');
    }
  }

  continueToLogin() {
    if (!this.hasBackedUpKey) {
      alert('Please confirm that you have backed up your private key');
      return;
    }
    
    this.privateKey = '';
    this.password = '';
    this.confirmPassword = '';
    
    this.router.navigate(['/login']);
  }
}