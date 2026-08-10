export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.CANCELED]: 'Canceled',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: '#FF9800',
  [BookingStatus.CONFIRMED]: '#2196F3',
  [BookingStatus.COMPLETED]: '#4CAF50',
  [BookingStatus.CANCELED]: '#F44336',
};
