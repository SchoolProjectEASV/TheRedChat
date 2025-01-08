import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.username && this.password && this.confirmPassword) {
      if (this.password === this.confirmPassword) {
        this.authService.register(this.username, this.password).subscribe(
          (response) => {
            if (response && response.message) {
              alert(response.message);
              this.router.navigate(['/']);
            } else {
              alert('Registration successful, but no confirmation message received.');
            }
          },
          (error) => {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
          }
        );
      } else {
        alert('Passwords do not match.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  }
}
