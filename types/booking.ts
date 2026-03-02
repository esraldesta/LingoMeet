export interface ProfessionalBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  learner: {
    name: string;
    image: string | null;
    email: string;
  };
  room: {
    id: string;
  } | null;
}