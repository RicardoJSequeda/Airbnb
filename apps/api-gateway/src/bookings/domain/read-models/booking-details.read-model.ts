export interface BookingDetailsReadModel {
  bookingId: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  organizationId: string;
  tenantId: string;
  regionId: string;
  status: string;
  paymentStatus: string | null;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  createdAt: Date;
}
