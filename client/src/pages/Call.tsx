import { useEffect, useRef, useState } from "react";
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

      <Draggable>
        <div className="absolute right-0 top-0 h-32 w-32 shrink-0 rounded bg-blue-800 overflow-clip z-50">
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
      <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-t-full -bottom-1 left-1/2 dark:bg-gray-700 dark:border-gray-600 overflow-hidden">
        <div className="flex h-full max-w-lg justify-between mx-auto">
          {/* Mute/Unmute */}
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pl-16"
            onClick={toggleMute}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
            ) : (
              <Mic className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
            )}
            <span className="sr-only">Mute/Unmute</span>
          </button>

          {/* End Call */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={endCall}
              className="inline-flex items-center justify-center w-10 h-10 font-medium bg-red-50 rounded-full hover:bg-red-700 group"
            >
              <svg
                width="185px"
                height="185px"
                viewBox="-4.56 -4.56 33.12 33.12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#f52929"
                strokeWidth="0.00024000000000000003"
              >
                <path
                  d="M8 13.4782L8 12.8617C8 12.8617 8 11.3963 12 11.3963C16 11.3963 16 12.8617 16 12.8617V13.25C16 14.2064 16.7227 15.0192 17.7004 15.1625L19.7004 15.4556C20.9105 15.6329 22 14.7267 22 13.5429V11.4183C22 10.8313 21.8162 10.2542 21.3703 9.85601C20.2296 8.83732 17.4208 7 12 7C6.25141 7 3.44027 9.58269 2.44083 10.7889C2.1247 11.1704 2 11.6525 2 12.1414L2 14.0643C2 15.3623 3.29561 16.292 4.57997 15.9156L6.57997 15.3295C7.42329 15.0823 8 14.3305 8 13.4782Z"
                  fill="#f2240d"
                ></path>
              </svg>
              <span className="sr-only">End Call</span>
            </button>
          </div>

          {/* Disable/Enable Video */}
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pr-16"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? (
              <Camera className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
            ) : (
              <CameraOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
            )}
            <span className="sr-only">Disable/Enable Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
