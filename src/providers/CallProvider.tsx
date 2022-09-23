import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import { setPeerConnectionListeners } from './PeerConnection';

export enum ROOM_STATUS {
  waiting,
  calling,
  ringing,
  connecting,
  connected,
  rejected,
  full,
}

const SOCKET_EVENTS = {
  createRoom: 'create or join',
  created: 'created',
  joined: 'joined',
  full: 'full',
  callInitiated: 'call initiated',
  callAccepted: 'call accepted',
  callRejected: 'call rejected',
  message: 'message',
};

const PC_CONFIG = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

const SDP_CONSTRAINTS = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

interface Props {
  roomName: string;
  userName: string;
  isReady: boolean;
  localMediaStream: MediaStream | null;
  children: ReactNode;
}

interface ContextProps {
  remoteMediaStream: MediaStream | null;
}

const CallContext = createContext<ContextProps>({
  remoteMediaStream: null,
});

const socket = io(SOCKET_URL);

export const CallProvider: React.FC<Props> = ({ children, roomName, isReady, userName, localMediaStream }) => {
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [memberSocketId, setMemberSocketId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<ROOM_STATUS>(ROOM_STATUS.waiting);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [socketMessage, setSocketMessage] = useState<any>(null);
  const [isPeerCreated, setIsPeerCreated] = useState<boolean>(false);
  const peerConnectionRef = useRef<ShimPeerConnection | null>(null);

  const onCreateSessionDescriptionError = (error: any) => {
    console.log(`Failed to create session description: ${error.toString()}`);
  };

  const doAnswer = () => {
    console.log('Sending answer to peer.');
    if (peerConnectionRef.current) {
      peerConnectionRef.current
        .createAnswer()
        .then((answer) => setLocalAndSendMessage(answer))
        .catch(onCreateSessionDescriptionError);
    }
  };

  const stop = () => {
    console.log('caaling stop');
    peerConnectionRef?.current?.close();
  };

  const handleRemoteHangup = () => {
    console.log('Session terminated.');
    stop();
  };

  const onRemoteStream = (remoteStream: MediaStream) => {
    console.log('received remote stream');
    setRemoteMediaStream(remoteStream);
  };

  const sendMessage = (message: any) => {
    console.log('Client sending message: ', message);
    socket.emit('message', message);
  };

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection(PC_CONFIG) as ShimPeerConnection;
      setPeerConnectionListeners(pc, sendMessage, onRemoteStream);
      if (localMediaStream) {
        localMediaStream.getTracks().forEach((track: MediaStreamTrack) => {
          pc.addTrack(track, localMediaStream);
        });
      }
      peerConnectionRef.current = pc;
      setIsPeerCreated(true);
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log(`Failed to create PeerConnection, exception: ${e.message}`);
      alert('Cannot create RTCPeerConnection object.');
    }
  };

  function setLocalAndSendMessage(sessionDescription: RTCSessionDescriptionInit) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      sendMessage(sessionDescription);
    }
  }

  function handleCreateOfferError(event: unknown) {
    console.log('createOffer() error: ', event);
  }

  const doCall = () => {
    if (peerConnectionRef.current) {
      console.log('Sending offer to peer');
      peerConnectionRef.current
        .createOffer(SDP_CONSTRAINTS)
        .then((offer) => setLocalAndSendMessage(offer))
        .catch(handleCreateOfferError);
    }
  };

  useEffect(() => {
    if (isReady && roomName) {
      socket.emit(SOCKET_EVENTS.createRoom, roomName);
    }
  }, [isReady, roomName]);

  useEffect(() => {
    console.log('here, shoudld create offer');
    if (roomState === ROOM_STATUS.connecting && isInitiator && isPeerCreated) {
      console.log('starting call by creating offer');
      doCall();
    }
  }, [roomState, isPeerCreated, isInitiator]);

  useEffect(() => {
    if (roomState === ROOM_STATUS.connecting) {
      console.log('creating peer connection');
      createPeerConnection();
    }
  }, [roomState]);

  useEffect(() => {
    if (socketMessage) {
      if (socketMessage.type === 'offer') {
        if (!isInitiator) {
          createPeerConnection();
        }
        peerConnectionRef?.current?.setRemoteDescription(new RTCSessionDescription(socketMessage));
        doAnswer();
      } else if (socketMessage.type === 'answer') {
        peerConnectionRef?.current?.setRemoteDescription(new RTCSessionDescription(socketMessage));
      } else if (socketMessage.type === 'candidate') {
        const candidate = new RTCIceCandidate({
          sdpMLineIndex: socketMessage.label,
          candidate: socketMessage.candidate,
        });
        peerConnectionRef?.current?.addIceCandidate(candidate);
      } else if (socketMessage === 'bye') {
        handleRemoteHangup();
      }
    }
  }, [socketMessage]);

  useEffect(() => {
    socket.on(SOCKET_EVENTS.created, () => {
      setIsInitiator(true);
    });

    socket.on(SOCKET_EVENTS.full, () => {
      setRoomState(ROOM_STATUS.full);
    });

    socket.on(SOCKET_EVENTS.joined, (memberSocketId: string) => {
      setMemberSocketId(memberSocketId);
      const result = confirm('Do you want to start a call?');
      if (result) {
        setRoomState(ROOM_STATUS.calling);
        socket.emit(SOCKET_EVENTS.callInitiated, memberSocketId, userName);
      }
    });

    socket.on('log', (array) => {
      console.log(...array);
    });

    socket.on(SOCKET_EVENTS.callInitiated, (memberSocketId, memberName) => {
      setRoomState(ROOM_STATUS.ringing);
      const result = confirm(`Someone is calling you. Do you want to accept the call?`);
      if (result) {
        setMemberSocketId(memberSocketId);
        setMemberName(memberName);
        socket.emit(SOCKET_EVENTS.callAccepted, memberSocketId, userName);
        setRoomState(ROOM_STATUS.connecting);
      } else {
        socket.emit(SOCKET_EVENTS.callRejected, memberSocketId);
      }
    });
    socket.on(SOCKET_EVENTS.callAccepted, (memberName) => {
      setMemberName(memberName);
      setRoomState(ROOM_STATUS.connecting);
    });

    socket.on(SOCKET_EVENTS.callRejected, () => {
      setRoomState(ROOM_STATUS.rejected);
    });

    socket.on(SOCKET_EVENTS.message, (message) => {
      setSocketMessage(message);
    });

    return () => socket.removeAllListeners();
  }, []);

  return (
    <CallContext.Provider
      value={{
        remoteMediaStream,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export function useCallProviderContext(): ContextProps {
  const context = React.useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCallProviderContext must be used within Call Provider');
  }
  return context;
}
