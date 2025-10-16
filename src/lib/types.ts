export interface ReservationData {
  meetingName: string;
  personName: string;
  mobileNumber: string;
  date: string; // ISO date string
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:00"
  roomSize: "small" | "large";
  pin: string;
}

export interface Reservation extends ReservationData {
  id: string;
}
