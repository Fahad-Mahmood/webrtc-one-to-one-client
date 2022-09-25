import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
import { RoomSettings } from '../../src/components/RoomSettings';
import { ChatRoom } from '../../src/components/ChatRoom';
import { CallProvider } from '../../src/providers/CallProvider';
import { DeviceProvider, useDeviceProviderContext } from '../../src/providers/DeviceProvider';

const PAGE_TITLE = 'WebRTC Ventures Join Room 1:1';

const ChatHome: NextPage = () => {
  const router = useRouter();
  const roomName = router.query.room as string;
  const [userName, setUserName] = useState<string>('');
  const [isRoomJoined, setIsRoomJoined] = useState<boolean>(false);

  const { startMediaStream } = useDeviceProviderContext();

  const onUserNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const onJoin = () => {
    if (userName.trim() !== '') {
      startMediaStream();
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
        <DeviceProvider>
          <CallProvider userName={userName} roomName={roomName} isReady={isRoomJoined}>
            {!isRoomJoined ? (
              <RoomSettings roomName={roomName} userName={userName} onUserNameInput={onUserNameInput} onJoin={onJoin} />
            ) : (
              <ChatRoom />
            )}
          </CallProvider>
        </DeviceProvider>
      </main>
    </div>
  );
};

export default ChatHome;
