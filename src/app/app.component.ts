import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

const FAVICON_SVG_DATA_URI =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%234F46E5%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%232563EB%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2232%22%20height%3D%2232%22%20rx%3D%228%22%20fill%3D%22url(%23bg)%22%2F%3E%3Cpolygon%20points%3D%2216%2C7%2027%2C13%2016%2C19%205%2C13%22%20fill%3D%22%23FFFFFF%22%2F%3E%3Cpath%20d%3D%22M10%2C16.5%20C10%2C21.5%2022%2C21.5%2022%2C16.5%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M26%2C13.5%20L26%2C20%22%20stroke%3D%22%23FDE047%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2221%22%20r%3D%221.2%22%20fill%3D%22%23FDE047%22%2F%3E%3C%2Fsvg%3E';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'EduEnroll - Course Enrollment Management System';
  private titleService = inject(Title);
  private router = inject(Router);

  ngOnInit(): void {
    this.enforceFavicon();
    this.updateTitleByRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateTitleByRoute(event.urlAfterRedirects || event.url);
      });
  }

  private enforceFavicon(): void {
    if (typeof document === 'undefined') return;

    try {
      // Remove any stale favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach((el) => el.remove());

      // Create fresh SVG icon link
      const svgLink = document.createElement('link');
      svgLink.rel = 'icon';
      svgLink.type = 'image/svg+xml';
      svgLink.href = FAVICON_SVG_DATA_URI;
      document.head.appendChild(svgLink);

      // Create fresh PNG fallback link with cache buster
      const pngLink = document.createElement('link');
      pngLink.rel = 'alternate icon';
      pngLink.type = 'image/png';
      pngLink.href = `/favicon.png?v=${Date.now()}`;
      document.head.appendChild(pngLink);
    } catch {
      // Silent in non-browser environments
    }
  }

  private updateTitleByRoute(url: string): void {
    const clean = (url || '').split('?')[0].split('#')[0];
    let page = 'Dashboard';

    if (clean.includes('/login')) page = 'Admin Login';
    else if (clean.includes('/students/add')) page = 'Add Student';
    else if (clean.includes('/students/edit')) page = 'Edit Student';
    else if (clean.includes('/students/')) page = 'Student Details';
    else if (clean.includes('/students')) page = 'Students';
    else if (clean.includes('/courses/add')) page = 'Add Course';
    else if (clean.includes('/courses/edit')) page = 'Edit Course';
    else if (clean.includes('/courses/')) page = 'Course Details';
    else if (clean.includes('/courses')) page = 'Courses';
    else if (clean.includes('/enrollments/add')) page = 'New Enrollment';
    else if (clean.includes('/enrollments/edit')) page = 'Edit Enrollment';
    else if (clean.includes('/enrollments/')) page = 'Enrollment Details';
    else if (clean.includes('/enrollments')) page = 'Enrollments';
    else if (clean.includes('/reports')) page = 'Reports & Analytics';
    else if (clean.includes('/settings')) page = 'Settings';
    else page = 'Dashboard';

    this.titleService.setTitle(`EduEnroll | ${page}`);
  }
}

export { AppComponent as App };
