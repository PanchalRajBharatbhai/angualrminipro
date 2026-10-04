import { SeatAvailabilityPipe } from './seat-availability.pipe';

describe('SeatAvailabilityPipe', () => {
  const pipe = new SeatAvailabilityPipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Course Full" when available seats are 0 or less', () => {
    expect(pipe.transform(0)).toBe('Course Full');
    expect(pipe.transform(-1)).toBe('Course Full');
  });

  it('should indicate urgency when 3 or fewer seats are left', () => {
    expect(pipe.transform(1)).toBe('Only 1 seat left!');
    expect(pipe.transform(3)).toBe('Only 3 seats left!');
  });

  it('should format available out of capacity when capacity is supplied', () => {
    expect(pipe.transform(15, 30)).toBe('15 of 30 seats available');
  });
});
