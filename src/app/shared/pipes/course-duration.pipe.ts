import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'courseDuration',
  standalone: true,
})
export class CourseDurationPipe implements PipeTransform {
  transform(value?: string | number): string {
    if (!value) return 'Flexible duration';

    const str = String(value).trim();
    const num = parseInt(str, 10);

    if (isNaN(num)) return str;

    if (num >= 14) {
      return `${num} Weeks (Full Semester)`;
    } else if (num >= 10) {
      return `${num} Weeks (Standard)`;
    } else if (num >= 6) {
      return `${num} Weeks (Accelerated)`;
    } else {
      return `${num} Weeks (Intensive)`;
    }
  }
}
