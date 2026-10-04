import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'seatAvailability',
  standalone: true,
})
export class SeatAvailabilityPipe implements PipeTransform {
  transform(availableSeats: number, capacity?: number): string {
    if (availableSeats <= 0) {
      return 'Course Full';
    }
    if (availableSeats <= 3) {
      return `Only ${availableSeats} seat${availableSeats > 1 ? 's' : ''} left!`;
    }
    if (capacity) {
      return `${availableSeats} of ${capacity} seats available`;
    }
    return `${availableSeats} seats available`;
  }
}
