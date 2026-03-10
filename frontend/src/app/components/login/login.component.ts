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

  // Register modal
  showRegisterModal = false;
  registerCredentials = {
    email: '',
    password: '',
  };
  registerLoading = false;
  registerError: string | null = null;
  registerSuccess = false;

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

  openRegisterModal() {
    this.showRegisterModal = true;
    this.registerCredentials = { email: '', password: '' };
    this.registerError = null;
    this.registerSuccess = false;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
    this.registerCredentials = { email: '', password: '' };
    this.registerError = null;
    this.registerSuccess = false;
  }

  onRegister() {
    this.registerLoading = true;
    this.registerError = null;

    this.authService.register(this.registerCredentials).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.registerSuccess = true;
          this.registerLoading = false;

          // Auto-close modal after 2 seconds and optionally auto-login
          setTimeout(() => {
            this.closeRegisterModal();
            // Optionally, you can auto-login the user
            // this.credentials = { ...this.registerCredentials };
            // this.onSubmit();
          }, 2000);
        }
        this.registerLoading = false;
      },
      error: (err) => {
        console.error('Register error:', err);
        // Check for specific error messages from backend
        if (err.error?.message) {
          this.registerError = err.error.message;
        } else if (err.status === 409) {
          this.registerError =
            'This email is already registered. Please use a different email.';
        } else if (err.status === 400) {
          this.registerError =
            'Invalid email or password format. Please check your input.';
        } else {
          this.registerError = 'Registration failed. Please try again.';
        }
        this.registerLoading = false;
      },
    });
  }
}
