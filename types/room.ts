import { RoomType, RoomStatus, ParticipantRole } from "@/generated/prisma/client"

export interface RoomWithParticipantCount {
  id: string;
  name: string;
  description: string | null;
  roomType: RoomType;
  language: string;
  topic: string | null;
  isPublic: boolean;
  maxParticipants: number;
  createdBy: string;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
  participantCount?: number;
  isFull?: boolean;
}

export interface RoomParticipant {
    id: string;
    userId: string;
    name?: string;
    peerId?: string
    role: ParticipantRole;
    roomId: string;
    leftAt: Date | null;
    joinedAt: Date;
}

export interface RoomDetailResponse {
  id: string;
  name: string;
  description?: string;
  roomType: RoomType;
  language: string;
  topic?: string;
  isPublic: boolean;
  maxParticipants: number;
  createdBy: string;
  teacherId?: string;
  status: RoomStatus;
  scheduledStartTime?: string;
  createdAt: string;
  updatedAt: string;
  participants: RoomParticipant[];
  participantCount: number;
  isFull: boolean;
  isParticipant: boolean;
}

// types.ts
export interface JoinRoomResponse {
  success: boolean;
  peerId: string;
  error?: string;
}


// interface Booking {
//   id: string;
//   startTime: Date;
//   endTime: Date;
//   status: string;
//   professional: {
//     user: {
//       name: string;
//       image: string | null;
//     }
//   };
//   room: {
//     id: string;
//   } | null;
// }