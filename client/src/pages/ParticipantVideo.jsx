import { useState } from "react";
import { Button } from "../components/ui/button";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

export default function ParticipantVideo({ participant, isActive }) {
  const [isMuted, setIsMuted] = useState(false); // For microphone mute/unmute
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // For enabling/disabling video

  // Toggle microphone mute/unmute
  const toggleMute = () => {
    const audioTrack = participant.stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // Toggle video stream on/off
  const toggleVideo = () => {
    const videoTrack = participant.stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled; // Toggle video on or off
      setIsVideoEnabled(videoTrack.enabled);
    }
  };
  return (
    <div
      key={participant.id} // Ensure unique key
      className={`${
        isActive ? "w-full h-80" : "w-24 h-full shrink-0"
      }   rounded relative`}
    >
      <video
        autoPlay
        playsInline
        ref={(el) => {
          if (el) el.srcObject = participant.stream;
        }}
        className="object-cover w-full h-full"
      />

      <div className="absolute top-3 left-3 flex space-x-2">
        {/* Mute/Unmute button */}
        {isActive ? (
          <Button variant="secondary" size="xs" onClick={toggleMute}>
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
        ) : (
          <button onClick={toggleMute}>
            {isMuted ? <MicOff size={10} /> : <Mic size={10} />}
          </button>
        )}
        {/* Enable/Disable video button */}
        {isActive ? (
          <Button variant="secondary" size="xs" onClick={toggleVideo}>
            {isVideoEnabled ? <Camera /> : <CameraOff />}
          </Button>
        ) : (
          <button onClick={toggleVideo}>
            {isVideoEnabled ? <Camera size={10} /> : <CameraOff size={10} />}
          </button>
        )}
      </div>
      <span       
      className={`${
        isActive ? "text-xs px-3 py-1 rounded-lg bottom-3 right-3 bg-opacity-50 bg-gray-800" : "text-[12px] bottom-1 right-1"
      }   absolute text-white`}
      >
        {participant.name || "Participant"}
      </span>
    </div>
  );
}
