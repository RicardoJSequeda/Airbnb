export interface BookingListByGuestReadModel {
  bookingId: string;
  propertyId: string;
  guestId: string;
  status: string;
  paymentStatus: string | null;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  createdAt: Date;
}
