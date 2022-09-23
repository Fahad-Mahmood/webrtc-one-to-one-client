import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { RoomSettings } from '../../src/components/RoomSettings';
import { ChatRoom } from '../../src/components/ChatRoom';
import { CallProvider } from '../../src/providers/CallProvider';

const PAGE_TITLE = 'WebRTC Ventures Join Room 1:1';

const ChatHome: NextPage = () => {
  const router = useRouter();
  const roomName = router.query.room as string;
  const [userName, setUserName] = useState<string>('');
  const [isRoomJoined, setIsRoomJoined] = useState<boolean>(false);
  const [mediaOptions, setMediaOptions] = useState<MediaOptions>({ audio: false, video: false });
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevices | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getMediaDevices = async () => {
      if (mediaOptions.audio || mediaOptions.video) {
        const audioConstraints = mediaOptions.audio
          ? { audio: selectedDevices?.audioDeviceId ? { deviceId: selectedDevices.audioDeviceId } : true }
          : { audio: false };
        const videoConstraints = mediaOptions.video
          ? { video: selectedDevices?.videoDeviceId ? { deviceId: selectedDevices.videoDeviceId } : true }
          : { video: false };
        const mediaConstraints = { ...audioConstraints, ...videoConstraints };
        const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        setLocalMediaStream(mediaStream);
      } else {
        setLocalMediaStream(null);
      }
    };
    getMediaDevices();
  }, [mediaOptions.audio, mediaOptions.video, selectedDevices?.audioDeviceId, selectedDevices?.videoDeviceId]);

  const onMediaOptionClick = (mediaOption: MediaOption) => {
    setMediaOptions({ ...mediaOptions, [mediaOption]: !mediaOptions[mediaOption] });
  };

  const onUserNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const onJoin = () => {
    if (userName.trim() !== '') {
      setIsRoomJoined(true);
    }
  };

  return (
    <div>
      <Head>
        <title>{PAGE_TITLE}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <CallProvider
          localMediaStream={localMediaStream}
          userName={userName}
          roomName={roomName}
          isReady={isRoomJoined}
        >
          {!isRoomJoined ? (
            <RoomSettings
              roomName={roomName}
              userName={userName}
              localMediaStream={localMediaStream}
              selectedDevices={selectedDevices}
              mediaOptions={mediaOptions}
              onMediaOptionClick={onMediaOptionClick}
              setSelectedDevices={setSelectedDevices}
              onUserNameInput={onUserNameInput}
              onJoin={onJoin}
            />
          ) : (
            <ChatRoom localMediaStream={localMediaStream} />
          )}
        </CallProvider>
      </main>
    </div>
  );
};

export default ChatHome;
