import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';

  onSubmit() {
    if (this.username && this.password && this.confirmPassword && this.password === this.confirmPassword) {
      alert(`Registering with Username: ${this.username}`);
      // Handle registration logic here
    } else if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
    } else {
      alert('Please fill in all fields.');
    }
  }
}
