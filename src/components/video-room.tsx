"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, Phone, Users } from "lucide-react";
import Peer, { DataConnection, MediaConnection } from "peerjs";

interface VideoRoomProps {
  room: {
    id: string;
    name: string;
    language: string;
    participants?: any[];
  };
  onLeave?: () => void; // Optional custom leave handler
  customControls?: React.ReactNode; // Optional custom controls
}

interface PeerInfo {
  peerId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

export function VideoRoom({ room, onLeave, customControls }: VideoRoomProps) {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerInfoMap, setPeerInfoMap] = useState<Map<string, PeerInfo>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, MediaConnection>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownPeerIdsRef = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    initializeRoom();

    return () => {
      cleanup();
    };
  }, [room.id]);

  const initializeRoom = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize PeerJS
      const peer = new Peer({
        host: process.env.NEXT_PUBLIC_PEERJS_HOST || "0.peerjs.com",
        port: parseInt(process.env.NEXT_PUBLIC_PEERJS_PORT || "443"),
        path: "/",
        secure: true,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peerRef.current = peer;

      peer.on("open", async (id) => {
        setMyPeerId(id);
        console.log("My peer ID is:", id);
        
        // Register this peer in the room
        await registerPeerInRoom(id);
        
        // Start SSE connection for real-time updates
        startEventStream(id);
      });

      // Handle incoming calls
      peer.on("call", (call: MediaConnection) => {
        const peerId = call.peer;
        console.log("Receiving call from:", peerId);
        
        // Don't accept if we already have a connection (prevent duplicates)
        if (connectionsRef.current.has(peerId)) {
          console.log("Already connected to peer, rejecting duplicate call:", peerId);
          call.close();
          return;
        }
        
        if (!streamRef.current) {
          console.error("No stream available to answer call");
          call.close();
          return;
        }

        call.answer(streamRef.current);
        
        call.on("stream", (remoteStream) => {
          console.log("Received stream from incoming call:", peerId);
          remoteStreams.set(peerId, remoteStream);
          setRemoteStreams(new Map(remoteStreams));
          setParticipants((prev) => {
            if (!prev.includes(peerId)) {
              return [...prev, peerId];
            }
            return prev;
          });

          // Fetch peer info if not already loaded
          fetch(`/api/rooms/${room.id}/peers`)
            .then(res => res.json() as Promise<{ peers: PeerInfo[] }>)
            .then(data => {
              const peerInfo = data.peers.find((p: PeerInfo) => p.peerId === peerId);
              if (peerInfo) {
                setPeerInfoMap(prev => {
                  const newMap = new Map(prev);
                  newMap.set(peerId, peerInfo);
                  return newMap;
                });
              }
            })
            .catch(err => console.error("Error fetching peer info:", err));

          // Set video element
          setTimeout(() => {
            const videoElement = remoteVideosRef.current.get(peerId);
            if (videoElement) {
              videoElement.srcObject = remoteStream;
              console.log("Video element set for incoming call:", peerId);
            }
          }, 100);
        });

        call.on("error", (err) => {
          console.error("Incoming call error with peer", peerId, ":", err);
          connectionsRef.current.delete(peerId);
        });

        call.on("close", () => {
          console.log("Incoming call closed with peer:", peerId);
          remoteStreams.delete(peerId);
          setRemoteStreams(new Map(remoteStreams));
          setParticipants((prev) => prev.filter((id) => id !== peerId));
          connectionsRef.current.delete(peerId);
        });

        connectionsRef.current.set(peerId, call);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
      });
    } catch (error) {
      console.error("Error initializing room:", error);
    }
  };

  const registerPeerInRoom = async (peerId: string) => {
    try {
      // Register peer ID in the room
      await fetch(`/api/rooms/${room.id}/peers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      });

      // Also register as participant
      await fetch(`/api/rooms/${room.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      });

      // Notify SSE about the join
      await fetch(`/api/rooms/${room.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "join", peerId }),
      });
    } catch (error) {
      console.error("Error registering peer:", error);
    }
  };

  const startEventStream = (myPeerId: string) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/rooms/${room.id}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "peers":
            // Initial peers list
            handlePeersUpdate(data.peers, myPeerId);
            break;
            
          case "peer-joined":
            console.log("Peer joined via SSE:", data.peer);
            handlePeerJoined(data.peer, myPeerId);
            break;
            
          case "peer-left":
            console.log("Peer left via SSE:", data.peerId);
            handlePeerLeft(data.peerId);
            break;
            
          case "ping":
            // Keep-alive, ignore
            break;
            
          default:
            console.log("Unknown SSE message:", data);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          startEventStream(myPeerId);
        }
      }, 5000);
    };
  };

  const handlePeersUpdate = (peers: PeerInfo[], myPeerId: string) => {
    // Update peer info map
    const newPeerInfoMap = new Map<string, PeerInfo>();
    peers.forEach((peer: PeerInfo) => {
      newPeerInfoMap.set(peer.peerId, peer);
    });
    setPeerInfoMap(newPeerInfoMap);
    
    // Connect to new peers we haven't connected to yet
    const otherPeers = peers
      .filter((peer: PeerInfo) => peer.peerId !== myPeerId && !connectionsRef.current.has(peer.peerId))
      .map((peer: PeerInfo) => peer.peerId);
    
    if (otherPeers.length > 0) {
      console.log("Connecting to peers from initial list:", otherPeers);
      
      otherPeers.forEach((peerId: string) => {
        if (myPeerId < peerId) {
          // We call peers with higher IDs
          connectToPeer(peerId);
        }
      });
    }
  };

  const handlePeerJoined = (peer: PeerInfo, myPeerId: string) => {
    // Update peer info map
    setPeerInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(peer.peerId, peer);
      return newMap;
    });
    
    // Connect to new peer if we should be the caller
    if (peer.peerId !== myPeerId && !connectionsRef.current.has(peer.peerId)) {
      if (myPeerId < peer.peerId) {
        // We call peers with higher IDs
        connectToPeer(peer.peerId);
      }
    }
  };

  const handlePeerLeft = (peerId: string) => {
    // Remove from peer info map
    setPeerInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
    
    // Clean up connection
    const connection = connectionsRef.current.get(peerId);
    if (connection) {
      connection.close();
      connectionsRef.current.delete(peerId);
    }
    
    // Remove from remote streams and participants
    remoteStreams.delete(peerId);
    setRemoteStreams(new Map(remoteStreams));
    setParticipants((prev) => prev.filter((id) => id !== peerId));
  };


  const connectToPeer = (peerId: string) => {
    if (!peerRef.current || !streamRef.current) {
      console.log("Cannot connect: peer or stream not ready");
      return;
    }

    // Don't connect if already connected
    if (connectionsRef.current.has(peerId)) {
      console.log("Already connected to peer:", peerId);
      return;
    }
    
    console.log("Attempting to call peer:", peerId);
    const call = peerRef.current.call(peerId, streamRef.current);
    
    if (!call) {
      console.error("Failed to create call to peer:", peerId);
      return;
    }

    call.on("stream", (remoteStream) => {
      console.log("Received stream from peer:", peerId);
      remoteStreams.set(peerId, remoteStream);
      setRemoteStreams(new Map(remoteStreams));
      setParticipants((prev) => {
        if (!prev.includes(peerId)) {
          return [...prev, peerId];
        }
        return prev;
      });

      // Fetch peer info if not already loaded
      fetch(`/api/rooms/${room.id}/peers`)
        .then(res => res.json() as Promise<{ peers: PeerInfo[] }>)
        .then(data => {
          const peerInfo = data.peers.find((p: PeerInfo) => p.peerId === peerId);
          if (peerInfo) {
            setPeerInfoMap(prev => {
              const newMap = new Map(prev);
              newMap.set(peerId, peerInfo);
              return newMap;
            });
          }
        })
        .catch(err => console.error("Error fetching peer info:", err));

      // Set video element
      setTimeout(() => {
        const videoElement = remoteVideosRef.current.get(peerId);
        if (videoElement) {
          videoElement.srcObject = remoteStream;
          console.log("Video element set for peer:", peerId);
        }
      }, 100);
    });

    call.on("error", (err) => {
      console.error("Call error with peer", peerId, ":", err);
      connectionsRef.current.delete(peerId);
    });

    call.on("close", () => {
      console.log("Call closed with peer:", peerId);
      remoteStreams.delete(peerId);
      setRemoteStreams(new Map(remoteStreams));
      setParticipants((prev) => prev.filter((id) => id !== peerId));
      connectionsRef.current.delete(peerId);
    });

    connectionsRef.current.set(peerId, call);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveRoom = async () => {
    if (myPeerId) {
      try {
        // Notify SSE about the leave
        await fetch(`/api/rooms/${room.id}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "leave", peerId: myPeerId }),
        });
        
        // Remove peer from room
        await fetch(`/api/rooms/${room.id}/peers`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peerId: myPeerId }),
        });
        
        // Mark as left in database
        await fetch(`/api/rooms/${room.id}/leave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peerId: myPeerId }),
        });
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
    cleanup();
    
    if (onLeave) {
        onLeave();
    } else {
        router.push("/dashboard");
    }
  };

  const cleanup = () => {
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Stop local stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    connectionsRef.current.forEach((call) => call.close());
    connectionsRef.current.clear();

    // Destroy peer
    if (peerRef.current) {
      peerRef.current.destroy();
    }
  };

  const participantCount = participants.length + 1; // +1 for self

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
            <span>{participantCount}</span>
          </div>
          {myPeerId && (
            <div className="text-xs text-muted-foreground">ID: {myPeerId.substring(0, 8)}</div>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="relative rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You {isMuted && "(Muted)"} {isVideoOff && "(Camera Off)"}
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([peerId, stream]) => {
            const peerInfo = peerInfoMap.get(peerId);
            const displayName = peerInfo?.userName || `Participant ${peerId.substring(0, 8)}`;
            
            return (
              <div key={peerId} className="relative rounded-lg overflow-hidden aspect-video">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideosRef.current.set(peerId, el);
                      el.srcObject = stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {displayName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-secondary px-6 py-4">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={leaveRoom}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Leave room"
          >
            <Phone className="w-6 h-6 rotate-135" />
          </button>
          
          {customControls && (
             <div className="border-l border-gray-600 pl-4 ml-2">
                 {customControls}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
