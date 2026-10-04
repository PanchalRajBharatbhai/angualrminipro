import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private storage: StorageService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    const savedUser = this.storage.getCurrentUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  public login(
    email: string,
    password?: string,
    remember = true
  ): Observable<User> {
    if (!email || !email.includes('@')) {
      return throwError(() => new Error('Please enter a valid institutional email address.'));
    }

    if (!password) {
      return throwError(() => new Error('Please enter your password.'));
    }

    const cleanEmail = email.trim().toLowerCase();
    const ADMIN_EMAIL = 'rajpanchal3406@gmail.com';
    const ADMIN_PASSWORD = 'Raj@342006';

    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password !== ADMIN_PASSWORD) {
        return throwError(() => new Error('Incorrect password. Please check your admin password and try again.'));
      }
    } else {
      return throwError(() => new Error('Invalid credentials. Administrator access required.'));
    }

    const adminUser: User = {
      ...this.storage.getDefaultDemoUser(),
      email: ADMIN_EMAIL,
      name: 'Raj Panchal',
    };

    return of(adminUser).pipe(
      tap((authenticatedUser) => {
        if (remember) {
          this.storage.saveCurrentUser(authenticatedUser);
        }
        this.currentUserSubject.next(authenticatedUser);
        this.notificationService.success(
          'Welcome Back',
          `Logged in successfully as Administrator ${authenticatedUser.name}`
        );
      })
    );
  }

  public logout(): void {
    this.storage.saveCurrentUser(null);
    this.currentUserSubject.next(null);
    this.notificationService.info('Logged Out', 'You have been safely signed out.');
    this.router.navigate(['/login']);
  }
}
