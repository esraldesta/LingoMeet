import { BookingStatus } from "@/generated/prisma/enums";

export interface ProfessionalBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  learner: {
    name: string;
    image: string | null;
    email: string;
  };
  room: {
    id: string;
  } | null;
}