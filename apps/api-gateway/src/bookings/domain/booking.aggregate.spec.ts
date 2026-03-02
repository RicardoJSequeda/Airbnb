import { Booking, BookingTransitionError } from './booking.aggregate';

describe('Booking aggregate', () => {
  it('creates booking and emits BOOKING_CREATED', () => {
    const result = Booking.create({
      propertyId: 'p1',
      guestId: 'g1',
      hostId: 'h1',
      checkIn: new Date('2030-01-10'),
      checkOut: new Date('2030-01-12'),
      guests: 2,
      maxGuestsAllowed: 4,
      pricePerNight: 100,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.booking.totalPrice).toBe(200);
    const events = result.booking.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('BOOKING_CREATED');
  });

  it('blocks invalid transition from completed to cancel', () => {
    const aggregate = Booking.fromState({
      id: 'b1',
      propertyId: 'p1',
      guestId: 'g1',
      hostId: 'h1',
      checkIn: new Date('2030-01-10'),
      checkOut: new Date('2030-01-12'),
      totalPrice: 200,
      status: 'COMPLETED',
    });

    expect(() => aggregate.cancel()).toThrow(BookingTransitionError);
  });
});
