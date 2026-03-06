"use client";

import { JoinRoomResponse, RoomDetailResponse, RoomParticipant } from "@/types/room";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Peer, { MediaConnection } from "peerjs";
import { CheckCircle2, Loader2, Mic, MicOff, Phone, Users, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeSession } from "@/app/actions/booking";

interface VideoRoomProps {
  room: RoomDetailResponse;
  isPro?: boolean
}


interface GridLayout {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

const VIDEO_ASPECT_RATIO = 16 / 9;
const GRID_GAP = 8;


export async function joinRoom(roomId: string, peerId: string): Promise<JoinRoomResponse> {
  const res = await fetch(`/api/rooms/${roomId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ peerId }),
  });

  const data: JoinRoomResponse = await res.json();
  return data;

}

/**
 * Google Meet-style grid calculation.
 * Given the container size and the number of tiles, find the (cols, rows) arrangement
 * that maximises the tile area while keeping every tile at 16 : 9 and fitting
 * everything inside the container without scrolling.
 */
function computeGridLayout(
  containerWidth: number,
  containerHeight: number,
  tileCount: number
): GridLayout {
  if (tileCount === 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { cols: 1, rows: 1, tileWidth: containerWidth, tileHeight: containerHeight };
  }

  let bestLayout: GridLayout = { cols: 1, rows: tileCount, tileWidth: 0, tileHeight: 0 };
  let bestArea = 0;

  for (let cols = 1; cols <= tileCount; cols++) {
    const rows = Math.ceil(tileCount / cols);

    // Available space per tile after accounting for gaps
    const availableWidth = (containerWidth - (cols - 1) * GRID_GAP) / cols;
    const availableHeight = (containerHeight - (rows - 1) * GRID_GAP) / rows;

    // The tile must fit both width- and height-wise at 16:9
    let tileWidth: number;
    let tileHeight: number;

    if (availableWidth / availableHeight > VIDEO_ASPECT_RATIO) {
      // Height is the constraint
      tileHeight = availableHeight;
      tileWidth = tileHeight * VIDEO_ASPECT_RATIO;
    } else {
      // Width is the constraint
      tileWidth = availableWidth;
      tileHeight = tileWidth / VIDEO_ASPECT_RATIO;
    }

    const area = tileWidth * tileHeight;
    if (area > bestArea) {
      bestArea = area;
      bestLayout = { cols, rows, tileWidth: Math.floor(tileWidth), tileHeight: Math.floor(tileHeight) };
    }
  }

  return bestLayout;
}

export function VideoRoom({ room, isPro }: VideoRoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initializedRef = useRef(false);

  const peerRef = useRef<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const peerInitializedRef = useRef(false);

  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const connectionsRef = useRef<Map<string, MediaConnection>>(new Map());

  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  const router = useRouter();

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [participants, setParticipants] = useState<Map<string, RoomParticipant>>(new Map());

  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);


  const audioContextRef = useRef<AudioContext | null>(null);

  const analyzeStream = (stream: MediaStream, id: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);

      const volume =
        dataArray.reduce((sum, value) => sum + value, 0) /
        dataArray.length;

      // Adjust threshold if needed
      if (volume > 30) {
        setActiveSpeaker(id);
      }

      requestAnimationFrame(checkVolume);
    };

    checkVolume();
  };



  // ── Responsive grid layout via ResizeObserver ──
  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tileCount = 1 + streams.size; // self + remotes, subtract 1 for the local stream

  const gridLayout = useMemo(
    () => computeGridLayout(containerSize.width, containerSize.height, tileCount),
    [containerSize.width, containerSize.height, tileCount]
  );

  // Start Analyzing When Streams Change
  useEffect(() => {
    // Analyze local stream
    if (streamRef.current) {
      analyzeStream(streamRef.current, "local");
    }

    // Analyze remote streams
    streams.forEach((stream, peerId) => {
      analyzeStream(stream, peerId);
    });
  }, [streams]);

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setIsMuted(prev => !prev);
  };

  const toggleVideo = () => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    setIsVideoOff(prev => !prev);
  };

  const connectToPeer = (targetPeerId: string) => {
    if (!peerRef.current || !streamRef.current) return;
    if (connectionsRef.current.has(targetPeerId)) return;

    const call = peerRef.current.call(targetPeerId, streamRef.current);

    call.on("stream", (remoteStream: MediaStream) => {
      setStreams(prev => new Map(prev).set(targetPeerId, remoteStream));
    });

    call.on("close", () => {
      connectionsRef.current.delete(targetPeerId);
      setStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(targetPeerId);
        return newMap;
      });
      remoteVideosRef.current.delete(targetPeerId);
    });

    connectionsRef.current.set(targetPeerId, call);
  };

  const leaveRoom = async () => {
    if (!peerId) return;

    await fetch(`/api/rooms/${room.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peerId }),
    });

    connectionsRef.current.forEach(call => call.close());
    connectionsRef.current.clear();

    peerRef.current?.destroy();
    stopMedia();
    if (isPro) {
      router.push("/pro/sessions");
    } else {
      router.push("/sessions");
    }
  };


  const handleEndSession = async () => {
    if (!room || !peerId) return;

    if (!confirm("Are you sure you want to end this session?")) {
      return;
    }

    setCompleting(true);

    try {
      await fetch(`/api/rooms/${room.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      });

      connectionsRef.current.forEach(call => call.close());
      connectionsRef.current.clear();

      peerRef.current?.destroy();
      stopMedia();
      await completeSession(room.id);


      router.push("/pro/sessions");
    } catch (err) {
      console.error(err);
      setCompleting(false);
    }
  };


  // Start local camera
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const startCamera = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    };

    startCamera();
    return () => stopMedia();
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    if (peerInitializedRef.current) return;
    peerInitializedRef.current = true;

    const peer = new Peer({ host: "0.peerjs.com", secure: true, port: 443 });
    peerRef.current = peer;

    peer.on("open", (id: string) => setPeerId(id));

    peer.on("error", (err: any) => console.error("Peer error:", err));

    peer.on("call", (call: MediaConnection) => {
      const incomingPeerId = call.peer;
      if (!streamRef.current || connectionsRef.current.has(incomingPeerId)) {
        call.close();
        return;
      }

      call.answer(streamRef.current);

      call.on("stream", (remoteStream: MediaStream) => {
        setStreams(prev => new Map(prev).set(incomingPeerId, remoteStream));
      });

      call.on("close", () => {
        connectionsRef.current.delete(incomingPeerId);
        setStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(incomingPeerId);
          return newMap;
        });
        remoteVideosRef.current.delete(incomingPeerId);
      });

      connectionsRef.current.set(incomingPeerId, call);
    });

    return () => {
      connectionsRef.current.forEach(call => call.close());
      connectionsRef.current.clear();
      peer.destroy();
    };
  }, []);

  // Auto-fetch participants and connect
  useEffect(() => {
    if (!peerId) return;

    const initJoin = async () => {
      const data = await joinRoom(room.id, peerId);
      if (data?.peerId) {

        // Now fetch other participants
        try {
          const res = await fetch(`/api/rooms/${room.id}/peers`);
          const data: { participants: RoomParticipant[] } = await res.json();
          const participantMap = new Map<string, RoomParticipant>();
          data.participants.forEach(p => {
            if (p.peerId) {
              participantMap.set(p.peerId, p);
            }
          });
          setParticipants(prev => {
            const newMap = new Map(prev);
            data.participants.forEach(p => {
              if (p.peerId) {
                newMap.set(p.peerId, p);
              }
            });
            return newMap;
          });

          data.participants.forEach(p => {
            if (p.peerId && p.peerId !== peerId) {
              connectToPeer(p.peerId);
            }
          });
        } catch (err) {
          console.error("Failed to fetch participants:", err);
        }
      } else if (data.error === "You are already connected to another room. Leave it first.") {
        console.log(data.error);
          router.replace(isPro?'/room/alreadyconnected?type=pro':'/room/alreadyconnected')
      }
      else {
        router.replace('/home')
      }
    };

    initJoin();
  }, [peerId, room.id]);

  // Sync remote streams to video elements
  useEffect(() => {
    streams.forEach((stream, peerId) => {
      const videoEl = remoteVideosRef.current.get(peerId);
      if (videoEl && videoEl.srcObject !== stream) videoEl.srcObject = stream;
    });
  }, [streams]);

  useEffect(() => {
    const handleUnload = () => {
      if (!peerId) return;
      const blob = new Blob(
        [JSON.stringify({ peerId })],
        { type: "application/json" }
      );

      navigator.sendBeacon(
        `/api/rooms/${room.id}/leave`,
        blob
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [room.id]);

  // Refetch When New Stream Appears
  useEffect(() => {
    if (!peerId) return;

    const fetchParticipants = async () => {
      try {
        const res = await fetch(`/api/rooms/${room.id}/peers`);
        const data: { participants: RoomParticipant[] } = await res.json();

        setParticipants(prev => {
          const newMap = new Map(prev);
          data.participants.forEach(p => {
            if (p.peerId) {
              newMap.set(p.peerId, p);
            }
          });
          return newMap;
        });
      } catch (err) {
        console.error("Failed to refresh participants:", err);
      }
    };

    fetchParticipants();
  }, [streams.size]); // triggers when someone joins/leaves
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-secondary px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">{room.name}</h1>
          <p className="text-sm text-muted-foreground">{room.language}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{streams.size + 1}</span>
          </div>
          {peerId && (
            <div className="text-xs text-muted-foreground">ID: {peerId.substring(0, 8)}</div>
          )}
        </div>
      </div>


      {/* Video Grid – Google Meet style: no scroll, maximise tile size */}
      <div
        ref={gridContainerRef}
        className="flex-1 overflow-hidden p-2"
      >
        <div
          className="flex flex-wrap items-center justify-center content-center w-full h-full"
          style={{ gap: `${GRID_GAP}px` }}
        >
          {/* Local Video */}
          <div
            className={`relative rounded-lg overflow-hidden shrink-0
              ${activeSpeaker === "local" ? "ring-4 ring-green-500" : ""}
            `}
            style={{
              width: gridLayout.tileWidth,
              height: gridLayout.tileHeight,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {isVideoOff && (
              <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                  You
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs sm:text-sm flex items-center gap-1.5">
              <span>You</span>
              {isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(streams.entries()).map(([peerId]) => {
            const participant = participants.get(peerId);
            const displayName = participant?.name || "User";

            return (
              <div
                key={peerId}
                className={`relative rounded-lg overflow-hidden shrink-0
                  ${activeSpeaker === peerId ? "ring-4 ring-green-500" : ""}
                `}
                style={{
                  width: gridLayout.tileWidth,
                  height: gridLayout.tileHeight,
                }}
              >
                <video
                  key={peerId}
                  ref={el => { if (el) remoteVideosRef.current.set(peerId, el); }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs sm:text-sm">
                  {displayName}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Controls – Google Meet style bottom bar */}
      <div className="bg-secondary px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMute}
            className={`p-2.5 sm:p-3 rounded-full transition-colors ${isMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-muted hover:bg-muted/80"
              } text-foreground`}
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-2.5 sm:p-3 rounded-full transition-colors ${isVideoOff
              ? "bg-red-600 hover:bg-red-700"
              : "bg-muted hover:bg-muted/80"
              } text-foreground`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={leaveRoom}
            className="p-2.5 sm:p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Leave room"
            aria-label="Leave room"
          >
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 rotate-135" />
          </button>

          {isPro && <Button
            variant="destructive"
            size="sm"
            onClick={handleEndSession}
            disabled={completing}
          >
            {completing ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            End Session
          </Button>}
        </div>
      </div>

    </div>
  );
}