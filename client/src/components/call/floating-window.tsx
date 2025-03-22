import { useRoom } from "@/context/room-context";
import { Button } from "../ui/button";
import Draggable from "react-draggable";
import { useLocation } from "react-router-dom";
import { Ref, RefObject, useEffect, useRef, useState } from "react";

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
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Draggable nodeRef={ref as RefObject<HTMLElement>}>
      <div className="flex gap-4" ref={ref as Ref<HTMLDivElement>}>
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
