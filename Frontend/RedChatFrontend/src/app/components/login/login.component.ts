import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  onSubmit() {
    if (this.email && this.password) {
      alert(`Logging in with Email: ${this.email}`);
      // Handle login logic here
    } else {
      alert('Please fill in both email and password.');
    }
  }

  onRegister() {
    alert('Redirecting to registration...');
  }

}
