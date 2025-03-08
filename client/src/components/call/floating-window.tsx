import { useRoom } from "@/context/room-context";
import { Button } from "../ui/button";
import Draggable from "react-draggable";
import { useLocation } from "react-router-dom";

export function FloatingWindow() {
  // const pathname = useLocation().pathname;
  const {
    conn,
    setConn,
    setParticipants,
    myVideoRef,
    setStream,
    participants,
    activeParticipantIndex,
    addParticipantStream,
    removeParticipantStream,
    handleParticipantClick,
    isMuted,
    toggleMute,
    endCall,
    toggleVideo,
    isVideoEnabled,
    setPeerConnections,
  } = useRoom();

  if (!conn) {
    return null;
  }

  return (
    <Draggable>
      <div className="flex gap-4">
        <Button onClick={toggleMute} className="floating-button">
          T
        </Button>
        <Button onClick={endCall} className="floating-button">
          E
        </Button>
        <Button onClick={endCall} className="floating-button">
          {participants.length}
        </Button>
      </div>
    </Draggable>
  );
}
