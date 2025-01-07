import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {RegisterComponent} from "../register/register.component";
import {FormsModule} from "@angular/forms"; // Import Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.username && this.password) {
      alert(`Logging in with Email: ${this.username}`);
      // Handle login logic here
    } else {
      alert('Please fill in both username and password.');
    }
  }

  onRegister() {
    this.router.navigate(['/register']).then(r => RegisterComponent);
  }
}
