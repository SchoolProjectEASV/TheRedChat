import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import {ChatComponent} from "../chat/chat.component";
import {RegisterComponent} from "../register/register.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password).subscribe(
        () => {
          this.router.navigate(['/chat']).then(r => ChatComponent);
        },
        (error) => {
          alert('Login failed. Please check your credentials.');
        }
      );
    } else {
      alert('Please fill in both username and password.');
    }
  }

  onRegister() {
    this.router.navigate(['/register']).then(r => RegisterComponent);
  }
}
