import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconComponent,
    AutoFocusDirective,
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <!-- Top Brand Header -->
        <div class="login-header">
          <div class="brand-badge">
            <app-icon name="graduation-cap" [size]="28" color="#ffffff"></app-icon>
          </div>
          <h2>EduEnroll Portal</h2>
          <p>Course Enrollment & Academic Management System</p>
        </div>

        <!-- Login Card -->
        <div class="login-card">
          <div class="card-inner">
            <div class="card-title-group">
              <h3>Sign In to Your Account</h3>
              <p>Enter your institutional credentials to access the admin portal</p>
            </div>

            @if (errorMessage) {
              <div class="alert-error" role="alert">
                <app-icon name="alert-circle" [size]="18"></app-icon>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <!-- Email Input -->
              <div class="form-group">
                <label for="email" class="form-label required">Email Address</label>
                <div class="input-icon-wrap">
                  <app-icon name="mail" [size]="16" class="field-icon"></app-icon>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-control"
                    [class.is-invalid]="f['email'].touched && f['email'].invalid"
                    placeholder="e.g., admin@university.edu"
                    appAutoFocus
                  />
                </div>
                @if (f['email'].touched && f['email'].invalid) {
                  <div class="form-error">
                    <app-icon name="alert-circle" [size]="12"></app-icon>
                    @if (f['email'].errors?.['required']) {
                      <span>Email is required</span>
                    } @else if (f['email'].errors?.['email']) {
                      <span>Please enter a valid institutional email</span>
                    }
                  </div>
                }
              </div>

              <!-- Password Input -->
              <div class="form-group">
                <div class="password-label-row">
                  <label for="password" class="form-label required">Password</label>
                </div>
                <div class="input-icon-wrap">
                  <app-icon name="shield" [size]="16" class="field-icon"></app-icon>
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    class="form-control"
                    [class.is-invalid]="f['password'].touched && f['password'].invalid"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    class="btn-toggle-pass"
                    (click)="showPassword = !showPassword"
                    [title]="showPassword ? 'Hide password' : 'Show password'"
                  >
                    <app-icon [name]="showPassword ? 'x' : 'eye'" [size]="15"></app-icon>
                  </button>
                </div>
                @if (f['password'].touched && f['password'].invalid) {
                  <div class="form-error">
                    <app-icon name="alert-circle" [size]="12"></app-icon>
                    <span>Password is required</span>
                  </div>
                }
              </div>

              <!-- Options -->
              <div class="form-options">
                <label class="remember-label">
                  <input type="checkbox" formControlName="rememberMe" />
                  <span>Remember session</span>
                </label>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-block"
                [disabled]="isLoading || loginForm.invalid"
              >
                @if (isLoading) {
                  <span class="btn-spinner"></span>
                  <span>Verifying credentials...</span>
                } @else {
                  <span>Sign In to Dashboard</span>
                  <app-icon name="arrow-right" [size]="16"></app-icon>
                }
              </button>
            </form>
          </div>
        </div>

        <div class="login-footer">
          <p>Course Enrollment Management System &bull; College Mini Project</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        min-height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(
            circle at top right,
            var(--primary-light),
            transparent 40%
          ),
          var(--bg-page);
        padding: 1.5rem;
      }

      .login-container {
        width: 100%;
        max-width: 440px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .login-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .brand-badge {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-lg);
        background: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
        margin-bottom: 0.85rem;
      }

      .login-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }
      .login-header p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
      }

      .login-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
      }

      .card-inner {
        padding: 2rem 2.25rem;
      }

      .card-title-group {
        margin-bottom: 1.5rem;
      }
      .card-title-group h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .card-title-group p {
        font-size: 0.8125rem;
        color: var(--text-muted);
        margin-top: 0.2rem;
      }

      .alert-error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        background: var(--danger-light);
        border: 1px solid var(--danger-border);
        color: var(--danger-text);
        font-size: 0.8125rem;
        margin-bottom: 1.25rem;
      }

      .password-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .input-icon-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .field-icon {
        position: absolute;
        left: 0.875rem;
        color: var(--text-muted);
        pointer-events: none;
      }

      .input-icon-wrap .form-control {
        padding-left: 2.5rem;
      }

      .btn-toggle-pass {
        position: absolute;
        right: 0.75rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-toggle-pass:hover {
        color: var(--text-primary);
      }

      .form-options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 1rem 0 1.25rem;
      }

      .remember-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        cursor: pointer;
      }

      .btn-block {
        width: 100%;
        font-size: 0.9375rem;
        min-height: 46px;
        margin-top: 0.5rem;
      }

      .login-footer {
        text-align: center;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .btn-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }

      @media (max-width: 480px) {
        .card-inner {
          padding: 1.5rem 1.25rem;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  public themeService = inject(ThemeService);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [true],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.message || 'Invalid institutional credentials. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
}
