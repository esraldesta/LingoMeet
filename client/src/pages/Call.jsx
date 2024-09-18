import { CameraOff, MicOff, Camera, Mic } from "lucide-react";
import { Button } from "../components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import { io } from "socket.io-client";
import { useParams } from "react-router";

export default function Call() {
  const [conn, setConn] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const { id: roomId } = useParams();
  const [participants, setParticipants] = useState([]);
  const myVideoRef = useRef();
  const [peerConnections, setPeerConnections] = useState({});
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false); // For microphone mute/unmute
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // For enabling/disabling video

  const placeholderImage = "https://via.placeholder.com/150"; // Placeholder image

  useEffect(() => {
    const peer = new Peer();
    const URL = "https://talkmate.onrender.com";
    const connectionOptions = {
      "force new connection": true,
      reconnectionAttempts: "Infinity",
      timeout: 10000,
      transports: ["websocket"],
    };
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
          setIsConnected(true);
        });

        peer.on("call", (call) => {
          call.answer(mediaStream);
          call.on("stream", (userVideoStream) => {
            addParticipantStream(call.peer, userVideoStream);
          });
        });

        socket.on("user-connected", (userId) => {
          const call = peer.call(userId, mediaStream);
          call.on("stream", (userVideoStream) => {
            addParticipantStream(userId, userVideoStream);
          });
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
        removeParticipantStream(userId);
      }
    });

    return () => {
      peer.disconnect();
      peer.destroy();
      socket.disconnect();
    };
  }, [roomId]);

  const addParticipantStream = (userId, stream) => {
    setParticipants((prevParticipants) => [
      ...prevParticipants,
      { id: userId, stream, isVideoEnabled: true },
    ]);
  };

  const removeParticipantStream = (userId) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.id !== userId)
    );
  };

  const toggleMute = () => {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // Stop all media tracks
    }
    window.location.href = "/"; // Redirect or handle call end
  };

  return (
    <div className="min-h-[50vh]">
      <div className="border-solid border-red-50 mx-2">
        <div className="flex flex-col items-center p-8 w-full h-full">
          <div className="w-full h-full flex flex-wrap rounded-lg overflow-hidden gap-1 justify-center">
            <div className="relative w-1/3 h-1/2 sm:w-1/4 sm:h-1/3 md:w-1/5 md:h-1/6 flex-shrink-0 bg-gray-10 rounded-lg overflow-clip">
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

            {participants.map((participant, index) => (
              <div
                key={participant.id || index}
                className="relative w-1/3 h-1/2 sm:w-1/4 sm:h-1/3 md:w-1/5 md:h-1/6 flex-shrink-0 bg-gray-10 rounded-lg overflow-clip"
              >
                {participant.isVideoEnabled ? (
                  <video
                    autoPlay
                    playsInline
                    ref={(el) => {
                      if (el) el.srcObject = participant.stream;
                    }}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <img
                    src={placeholderImage}
                    alt="Placeholder"
                    className="object-cover w-full h-full"
                  />
                )}
                <div className="absolute top-3 left-3 flex space-x-2">
                  <button
                    type="button"
                    className="p-2 bg-muted rounded-full"

                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <MicOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                    ) : (
                      <Mic className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                    )}
                    <span className="sr-only">Mute/Unmute</span>
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-muted rounded-full"
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? (
                      <CameraOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                    ) : (
                      <Camera className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                    )}
                    <span className="sr-only">Disable/Enable Video</span>
                  </button>
                </div>
                <span className="absolute bottom-3 right-3 bg-opacity-50 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg">
                  {participant.name || "Participant"}
                </span>
              </div>
            ))}
          </div>
        </div>
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
              <CameraOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
            ) : (
              <Camera className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
            )}
            <span className="sr-only">Disable/Enable Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
