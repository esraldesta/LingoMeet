import { useState } from "react";
import { Button } from "../components/ui/button";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

export default function ParticipantVideo({participant}) {
  
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
      className="relative w-full sm:w-1/2 md:w-1/3 flex-shrink-0 bg-gray-10 rounded-lg overflow-clip"
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
        <Button variant="secondary" size="xs" onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        {/* Enable/Disable video button */}
        <Button variant="secondary" size="xs" onClick={toggleVideo}>
          {isVideoEnabled ? <CameraOff /> : <Camera />}
        </Button>
      </div>
      <span className="absolute bottom-3 right-3 bg-opacity-50 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg">
        {participant.name || "Participant"}
      </span>
    </div>
  );
}
