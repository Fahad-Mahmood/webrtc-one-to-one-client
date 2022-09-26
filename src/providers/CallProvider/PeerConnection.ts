export const setPeerConnectionListeners = (
  peerConnection: ShimPeerConnection,
  sendMessage: any,
  onRemoteStream: any,
) => {
  const handleRemoteStreamAdded = (event: any) => {
    console.log('remote stream received', event);
    const [remoteStream] = event.streams;
    onRemoteStream(remoteStream);
  };

  const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      console.log('End of candidates.');
    }
  };

  const onConnectionStateChange = () => {
    console.log('connection state change: ', peerConnection.connectionState);
  };

  peerConnection.onconnectionstatechange = onConnectionStateChange;
  peerConnection.onicecandidate = handleIceCandidate;
  peerConnection.ontrack = handleRemoteStreamAdded;
};
