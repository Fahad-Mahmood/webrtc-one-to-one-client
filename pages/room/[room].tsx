import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Grid, Box, TextField, Typography } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, Settings } from '@mui/icons-material';
import { DeviceSettingsModal } from '../../src/components/modals/DeviceSettings';

const PAGE_TITLE = 'WebRTC Ventures Join Room 1:1';
const AUDIO_OPTION = 'audio';
const VIDEO_OPTION = 'video';
const INPUT_PLACEHOLDER = 'Type your name';
const JOIN_BTN_TEXT = 'Join the room';

const ICON_STYLES = { cursor: 'pointer', '&:hover': { opacity: 0.7 }, color: 'grey.200' };

const VideoPlayer = styled.video`
  height: 100%;
  width: 100%;
  object-fit: cover;
  transform: scale(-1, 1);
`;

const ChatRoom: NextPage = () => {
  const router = useRouter();
  const roomName = router.query.room;
  const [mediaOptions, setMediaOptions] = useState<MediaOptions>({ audio: false, video: false });
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevices | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  useEffect(() => {
    if (localMediaStream && videoRef?.current) {
      videoRef.current.srcObject = localMediaStream;
    }
  }, [localMediaStream, videoRef]);

  const onMediaOptionClick = (mediaOption: MediaOption) => {
    setMediaOptions({ ...mediaOptions, [mediaOption]: !mediaOptions[mediaOption] });
  };

  const onSettingsIconClick = () => {
    setSettingsModalVisible(true);
  };

  const onSettingsModalClose = (userSelectedDevices?: SelectedDevices) => {
    if (userSelectedDevices) {
      setSelectedDevices(userSelectedDevices);
    }
    setSettingsModalVisible(false);
  };

  return (
    <div>
      <Head>
        <title>{PAGE_TITLE}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Grid container direction="row" justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
          <Grid
            container
            direction="column"
            alignItems={'center'}
            justifyContent="center"
            sx={{ width: ['100vw', '30vw'], height: ['50%', '100%'], bgcolor: 'primary.light' }}
          >
            <Typography color="grey.100" mb={2} align="center" gutterBottom fontWeight={500} variant="h4">
              Join Room
            </Typography>
            <Typography color="grey.100" mb={2} align="center" gutterBottom variant="h6">
              {roomName}
            </Typography>
            <TextField
              focused
              color="secondary"
              sx={{ width: '80%', mb: 2, '& input': { color: 'grey.100' } }}
              placeholder={INPUT_PLACEHOLDER}
            />
            <Button sx={{ width: '80%', mb: 2 }} color="secondary" variant="contained">
              {JOIN_BTN_TEXT}
            </Button>
            <Grid container justifyContent="space-between" sx={{ width: '80%' }}>
              <Box>
                {mediaOptions.audio ? (
                  <Mic onClick={() => onMediaOptionClick(AUDIO_OPTION)} sx={{ ...ICON_STYLES }} />
                ) : (
                  <MicOff onClick={() => onMediaOptionClick(AUDIO_OPTION)} sx={{ ...ICON_STYLES }} />
                )}
                {mediaOptions.video ? (
                  <Videocam onClick={() => onMediaOptionClick(VIDEO_OPTION)} sx={{ ml: 1, ...ICON_STYLES }} />
                ) : (
                  <VideocamOff onClick={() => onMediaOptionClick(VIDEO_OPTION)} sx={{ ml: 1, ...ICON_STYLES }} />
                )}
              </Box>
              <Settings onClick={onSettingsIconClick} sx={{ ml: 1, ...ICON_STYLES }} />
            </Grid>
          </Grid>
          <Box sx={{ width: ['100vw', '70vw'], height: ['50%', '100%'], bgcolor: 'grey.900' }}>
            {mediaOptions.video && localMediaStream ? <VideoPlayer autoPlay muted ref={videoRef} /> : null}
          </Box>
          <DeviceSettingsModal
            isOpen={isSettingsModalVisible}
            onClose={onSettingsModalClose}
            selectedDevices={selectedDevices}
          />
        </Grid>
      </main>
    </div>
  );
};

export default ChatRoom;
