import { Ref, RefObject, useEffect, useRef, useState } from "react";
import { MediaConnection, Peer } from "peerjs";
import { io, SocketOptions } from "socket.io-client";
import { useParams } from "react-router";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import ParticipantVideo from "./ParticipantVideo";
import Draggable from "react-draggable";
import { useRoom } from "@/context/room-context";
import { UseCall } from "@/hooks/use-call";

export default function Call() {
  const { id: roomId } = useParams();
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
    peerConnections,
  } = useRoom();

  // Initialize the call logic
  UseCall({
    roomId,
    setConn,
    setParticipants,
    myVideoRef,
    setStream,
    addParticipantStream,
    removeParticipantStream,
    setPeerConnections,
    peerConnections,
  });

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="h-[80vh] flex flex-col items-center relative pt-2 px-2">
      {!conn && (
        <div>
          <p>Connecting...</p>
          <p className="text-[12px]">
            If it takes more than 30 seconds to connect, please try rejoining.
          </p>
        </div>
      )}
      {/* you */}

      <Draggable nodeRef={ref as RefObject<HTMLElement>}>
        {/* @ts-ignore */}
        <div
          className="absolute right-0 top-0 h-32 w-32 shrink-0 rounded bg-blue-800 overflow-clip z-50"
          ref={ref as Ref<HTMLDivElement>}
        >
          <video
            ref={myVideoRef}
            autoPlay
            muted
            className="object-cover w-full h-full"
          />

          <span className="absolute bottom-3 right-3 bg-opacity-50 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg">
            You
          </span>
        </div>
      </Draggable>

      {/* active */}

      <div className="h-full pt-10 mt-10 rounded-lg overflow-hidden">
        {activeParticipantIndex !== null &&
          participants[activeParticipantIndex] && (
            <ParticipantVideo
              participant={participants[activeParticipantIndex]}
              isActive={true}
            />
          )}
      </div>

      {/* participants */}

      <div className="h-28 max-w-full flex justify-start gap-1 overflow-x-auto">
        {participants.length}
        {participants.map((participant) => (
          <div
            key={participant.id}
            onClick={() => handleParticipantClick(participant.id)}
          >
            <ParticipantVideo participant={participant} isActive={false} />
          </div>
        ))}
      </div>

      {/* Bottom Section for controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
        >
          {isMuted ? <MicOff className="text-white w-5 h-5" /> : <Mic className="text-white w-5 h-5" />}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
        >
          <svg className="w-5 h-5 text-white" /* hang-up icon */ />
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
        >
          {isVideoEnabled ? (
            <Camera className="text-white w-5 h-5" />
          ) : (
            <CameraOff className="text-white w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
