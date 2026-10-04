import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // Public Login Route
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // Protected App Shell with Sub-routes
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },

      // Students
      {
        path: 'students',
        loadComponent: () =>
          import(
            './features/students/student-list/student-list.component'
          ).then((m) => m.StudentListComponent),
      },
      {
        path: 'students/add',
        loadComponent: () =>
          import(
            './features/students/student-form/student-form.component'
          ).then((m) => m.StudentFormComponent),
      },
      {
        path: 'students/:id',
        loadComponent: () =>
          import(
            './features/students/student-detail/student-detail.component'
          ).then((m) => m.StudentDetailComponent),
      },
      {
        path: 'students/edit/:id',
        loadComponent: () =>
          import(
            './features/students/student-form/student-form.component'
          ).then((m) => m.StudentFormComponent),
      },

      // Courses
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/course-list/course-list.component').then(
            (m) => m.CourseListComponent
          ),
      },
      {
        path: 'courses/add',
        loadComponent: () =>
          import('./features/courses/course-form/course-form.component').then(
            (m) => m.CourseFormComponent
          ),
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import(
            './features/courses/course-detail/course-detail.component'
          ).then((m) => m.CourseDetailComponent),
      },
      {
        path: 'courses/edit/:id',
        loadComponent: () =>
          import('./features/courses/course-form/course-form.component').then(
            (m) => m.CourseFormComponent
          ),
      },

      // Enrollments (Core Feature)
      {
        path: 'enrollments',
        loadComponent: () =>
          import(
            './features/enrollments/enrollment-list/enrollment-list.component'
          ).then((m) => m.EnrollmentListComponent),
      },
      {
        path: 'enrollments/add',
        loadComponent: () =>
          import(
            './features/enrollments/enrollment-form/enrollment-form.component'
          ).then((m) => m.EnrollmentFormComponent),
      },
      {
        path: 'enrollments/:id',
        loadComponent: () =>
          import(
            './features/enrollments/enrollment-detail/enrollment-detail.component'
          ).then((m) => m.EnrollmentDetailComponent),
      },
      {
        path: 'enrollments/edit/:id',
        loadComponent: () =>
          import(
            './features/enrollments/enrollment-form/enrollment-form.component'
          ).then((m) => m.EnrollmentFormComponent),
      },

      // Reports (Lazy Loaded Feature)
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },

      // Settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },

      // Wildcard within shell
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          ),
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'login',
  },
];
