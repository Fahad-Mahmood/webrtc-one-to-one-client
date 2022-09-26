import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config/constants';
import { useDeviceProviderContext } from '../DeviceProvider';
import { setPeerConnectionListeners } from './PeerConnection';

export enum ROOM_STATUS {
  waiting,
  canCall,
  calling,
  ringing,
  connecting,
  connected,
  rejected,
  full,
  ended,
}

const HANGUP_SOCKET_MESSAGE = 'bye';

const SOCKET_EVENTS = {
  createRoom: 'create or join',
  created: 'created',
  joined: 'joined',
  full: 'full',
  callInitiated: 'call initiated',
  callAccepted: 'call accepted',
  callRejected: 'call rejected',
  leaveRoom: 'leave room',
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
  children: ReactNode;
}

interface ContextProps {
  memberName: string | null;
  remoteMediaStream: MediaStream | null;
  roomState: ROOM_STATUS;
  onStartCall: () => void;
  onAnswerCall: (isAnswered: boolean) => void;
  onEndCall: () => void;
}

const CallContext = createContext<ContextProps>({
  memberName: '',
  remoteMediaStream: null,
  roomState: ROOM_STATUS.waiting,
  onStartCall: () => {},
  onAnswerCall: () => {},
  onEndCall: () => {},
});

const socket = io(SOCKET_URL);

export const CallProvider: React.FC<Props> = ({ children, roomName, isReady, userName }) => {
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<ROOM_STATUS>(ROOM_STATUS.waiting);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [socketMessage, setSocketMessage] = useState<any>(null);
  const [isPeerCreated, setIsPeerCreated] = useState<boolean>(false);
  const peerConnectionRef = useRef<ShimPeerConnection | null>(null);

  const { localMediaStream, stopMediaStream } = useDeviceProviderContext();

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

  const onRemoteStream = (remoteStream: MediaStream) => {
    console.log('received remote stream');
    setRemoteMediaStream(remoteStream);
    setRoomState(ROOM_STATUS.connected);
  };

  const sendMessage = (message: any) => {
    console.log('Client sending message: ', message);
    socket.emit('message', message, roomName);
  };

  const addStreamToPeer = (peerConnection: ShimPeerConnection) => {
    console.log('should add stream to peer', localMediaStream);
    if (localMediaStream) {
      console.log('adding stream to peer');
      localMediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        peerConnection.addTrack(track, localMediaStream);
      });
    }
  };

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection(PC_CONFIG) as ShimPeerConnection;
      setPeerConnectionListeners(pc, sendMessage, onRemoteStream);
      addStreamToPeer(pc);
      peerConnectionRef.current = pc;
      setIsPeerCreated(true);
      console.log('Created RTCPeerConnnection');
    } catch (e: any) {
      console.log(`Failed to create PeerConnection, exception: ${e?.message}`);
      alert('Cannot create RTCPeerConnection object.');
    }
  };

  const stopPeerConnection = () => {
    peerConnectionRef?.current?.close();
    peerConnectionRef.current = null;
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

  const onStartCall = () => {
    setRoomState(ROOM_STATUS.calling);
    socket.emit(SOCKET_EVENTS.callInitiated, userName, roomName);
  };

  const onAnswerCall = (isAnswered: boolean) => {
    if (isAnswered) {
      socket.emit(SOCKET_EVENTS.callAccepted, userName, roomName);
      setRoomState(ROOM_STATUS.connecting);
    } else {
      socket.emit(SOCKET_EVENTS.callRejected, roomName);
      setRoomState(ROOM_STATUS.waiting);
    }
  };

  const hangupCall = () => {
    setRoomState(ROOM_STATUS.ended);
    stopPeerConnection();
    stopMediaStream();
    setIsInitiator(false);
  };

  const onEndCall = () => {
    hangupCall();
    sendMessage(HANGUP_SOCKET_MESSAGE);
  };

  useEffect(() => {
    if (isReady && roomName) {
      socket.emit(SOCKET_EVENTS.createRoom, roomName);
    }
  }, [isReady, roomName]);

  useEffect(() => {
    console.log('here, shoudld create offer', isPeerCreated, isInitiator);
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
      } else if (socketMessage === HANGUP_SOCKET_MESSAGE) {
        hangupCall();
        socket.emit(SOCKET_EVENTS.leaveRoom, roomName);
      }
    }
  }, [socketMessage]);

  useEffect(() => {
    if (userName) {
      socket.on(SOCKET_EVENTS.created, () => {
        console.log('first user');
      });

      socket.on(SOCKET_EVENTS.full, () => {
        setRoomState(ROOM_STATUS.full);
      });

      socket.on(SOCKET_EVENTS.joined, () => {
        setRoomState(ROOM_STATUS.canCall);
      });

      socket.on('log', (array) => {
        console.log(...array);
      });

      socket.on(SOCKET_EVENTS.callInitiated, (memberName) => {
        console.log('call received, ', memberName);
        setRoomState(ROOM_STATUS.ringing);
        setMemberName(memberName);
        setIsInitiator(true);
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
    }
  }, [userName]);

  return (
    <CallContext.Provider
      value={{
        memberName,
        remoteMediaStream,
        roomState,
        onStartCall,
        onAnswerCall,
        onEndCall,
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
