// const RoomContext = createContext<{ state: State; dispatch: any }>(null);

// interface State {
//   conn: string | null;
//   participants: {
//     id: string;
//     stream: MediaStream;
//     isVideoEnabled: boolean;
//   }[];
//   peerConnections: {
//     [key: string]: MediaConnection;
//   };
//   stream: MediaStream | null;
//   isMuted: boolean;
//   isVideoEnabled: boolean;
//   activeParticipantIndex: number | null;
// }

// function reducer(state: State, action: { type: string; payload: any }) {
//   switch (action.type) {
//     case ROOM_ACTIONS.SET_CONNECTION:
//       return { ...state, conn: action.payload };
//     case ROOM_ACTIONS.SET_STREAM:
//       return {...state, stream: action.payload}
//   }
//   return state;
// }

// export function RoomProvider({ children }: { children: React.ReactNode }) {
//   const [state, dispatch] = useReducer(reducer, {
//     conn: null,
//     participants: [],
//     peerConnections: {},
//     stream: null,
//     isMuted: false,
//     isVideoEnabled: true,
//     activeParticipantIndex: null,
//   });
//   return (
//     <RoomContext.Provider value={{ state, dispatch }}>
//       {children}
//     </RoomContext.Provider>
//   );
// }

// export const useRoom = () => {
//   return useContext(RoomContext);
// };

// export const ROOM_ACTIONS = {
//   SET_CONNECTION: "SET_CONNECTION",
//   SET_STREAM: "SET_STREAM",
//   SET_IS_MUTED: "SET_IS_MUTED",
//   SET_IS_VIDEO_ENABLED: "SET_IS_VIDEO_ENABLED",
//   SET_ACTIVE_PARTICIPANT_INDEX: "SET_ACTIVE_PARTICIPANT_INDEX",
//   ADD_PARTICIPANT: "ADD_PARTICIPANT",
//   REMOVE_PARTICIPANT: "REMOVE_PARTICIPANT",
//   ADD_PER_CONNECTION: "ADD_PER_CONNECTIOIN",
//   REMOVE_PEER_CONNECTION: "REMOVE_PEER_CONNECTION",
// };

import { MediaConnection } from "peerjs";
import {
  createContext,
  useContext,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useParams } from "react-router-dom";

export interface Participant {
  id: string;
  stream: MediaStream;
  isVideoEnabled: boolean;
}

interface RoomContextValue {
  conn: string | null;
  setConn: Dispatch<SetStateAction<string | null>>;
  participants: Participant[];
  setParticipants: Dispatch<SetStateAction<Participant[]>>;
  myVideoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  setStream: Dispatch<SetStateAction<MediaStream | null>>;
  isMuted: boolean;
  setIsMuted: Dispatch<SetStateAction<boolean>>;
  isVideoEnabled: boolean;
  setIsVideoEnabled: Dispatch<SetStateAction<boolean>>;
  peerConnections: { [key: string]: MediaConnection };
  setPeerConnections: Dispatch<
    SetStateAction<{ [key: string]: MediaConnection }>
  >;
  activeParticipantIndex: number | null;
  setActiveParticipantIndex: Dispatch<SetStateAction<number | null>>;
  handleParticipantClick: (arg: string) => void;
  addParticipantStream: (userId: string, stream: MediaStream) => void;
  removeParticipantStream: (userId: string) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  endCall: () => void;
}

// Create the context
const RoomContext = createContext<RoomContextValue | null>(null);

// RoomProvider component
export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [conn, setConn] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peerConnections, setPeerConnections] = useState<{
    [key: string]: MediaConnection;
  }>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [activeParticipantIndex, setActiveParticipantIndex] = useState<
    number | null
  >(null);

  const handleParticipantClick = (participantId: string) => {
    const index = participants.findIndex((p) => p.id === participantId);
    setActiveParticipantIndex(index);
  };

  const addParticipantStream = (userId: string, stream: MediaStream) => {
    setParticipants((prevParticipants) => {
      if (prevParticipants.find((p) => p.id === userId)) {
        return prevParticipants;
      }
      return [
        ...prevParticipants,
        { id: userId, stream, isVideoEnabled: true },
      ];
    });
  };

  const removeParticipantStream = (userId: string) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.id !== userId)
    );
  };

  const toggleMute = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    window.location.href = "/";
  };

  return (
    <RoomContext.Provider
      value={{
        conn,
        setConn,
        participants,
        setParticipants,
        myVideoRef,
        stream,
        setStream,
        isMuted,
        setIsMuted,
        isVideoEnabled,
        setIsVideoEnabled,
        peerConnections,
        setPeerConnections,
        activeParticipantIndex,
        setActiveParticipantIndex,
        handleParticipantClick,
        addParticipantStream,
        removeParticipantStream,
        toggleMute,
        toggleVideo,
        endCall,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
