// use-call.ts
import { Participant, useRoom } from "@/context/room-context";
import Peer, { MediaConnection } from "peerjs";
import { Dispatch, SetStateAction, useEffect } from "react";
import { io, SocketOptions } from "socket.io-client";

export function UseCall({
  roomId,
  setConn,
  setParticipants,
  myVideoRef,
  setStream,
  addParticipantStream,
  removeParticipantStream,
  setPeerConnections,
  peerConnections,
}: {
  roomId: string | undefined;
  setConn: (conn: string | null) => void;
  setParticipants: Dispatch<SetStateAction<Participant[]>>;
  myVideoRef: React.RefObject<HTMLVideoElement>;
  setStream: (stream: MediaStream | null) => void;
  addParticipantStream: (userId: string, stream: MediaStream) => void;
  removeParticipantStream: (userId: string) => void;
  setPeerConnections: Dispatch<
    SetStateAction<{ [key: string]: MediaConnection }>
  >;
  peerConnections: { [key: string]: MediaConnection };
}) {
  useEffect(() => {
    const peer = new Peer();
    const URL = "http://localhost:3000";
    const connectionOptions = {
      "force new connection": true,
      reconnectionAttempts: "Infinity",
      timeout: 10000,
      transports: ["websocket"],
    } as SocketOptions;
    const socket = io(URL, connectionOptions);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }
        peer.on("open", (peerId) => {
          setConn(peerId);
          socket.emit("join-room", roomId, peerId);
        });

        peer.on("call", (call) => {
          console.log("call received");
          // Avoid answering multiple calls for the same user
          if (!peerConnections[call.peer]) {
            call.answer(mediaStream);
            call.on("stream", (userVideoStream) => {
              addParticipantStream(call.peer, userVideoStream);
            });
            setPeerConnections((prevConnections) => ({
              ...prevConnections,
              [call.peer]: call,
            }));
          }
        });

        socket.on("user-connected", (userId) => {
          console.log("socket call received");
          // Avoid calling users already connected
          if (!peerConnections[userId]) {
            const call = peer.call(userId, mediaStream);
            call.on("stream", (userVideoStream) => {
              addParticipantStream(userId, userVideoStream);
            });
            setPeerConnections((prevConnections) => ({
              ...prevConnections,
              [userId]: call,
            }));
          }
        });

        socket.on("video-state-changed", ({ userId, isVideoEnabled }) => {
          setParticipants((prevParticipants) =>
            prevParticipants.map((p) =>
              p.id === userId ? { ...p, isVideoEnabled } : p
            )
          );
        });
      });

    socket.on("user-disconnected", (userId) => {
      if (peerConnections[userId]) {
        peerConnections[userId].close();
      }
      removeParticipantStream(userId);
    });

    // return () => {
    //   peer.disconnect();
    //   peer.destroy();
    //   socket.disconnect();
    // };
  }, [roomId]);
}
