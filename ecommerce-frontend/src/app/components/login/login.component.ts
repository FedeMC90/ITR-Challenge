import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: '',
    password: '',
  };

  loading = false;
  error: string | null = null;

  onSubmit() {
    this.loading = true;
    this.error = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.router.navigate(['/products']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Invalid credentials. Please try again.';
        console.error('Login error:', err);
        this.loading = false;
      },
    });
  }
}
