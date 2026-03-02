export interface BookingListByHostReadModel {
  bookingId: string;
  propertyId: string;
  hostId: string;
  status: string;
  paymentStatus: string | null;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  createdAt: Date;
}
