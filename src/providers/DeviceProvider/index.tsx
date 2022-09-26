import { useRouter } from 'next/router';
import React, { ReactNode, createContext, useState, useEffect } from 'react';

const DEFAULT_MEDIA_OPTIONS = { audio: false, video: false };

const CHAT_ROOM_PATH = '/room/[room]';

interface ContextProps {
  isReady: boolean;
  selectedDevices: SelectedDevices | null;
  selectedAudioFilter: AudioFilter | null;
  mediaOptions: MediaOptions;
  localMediaStream: MediaStream | null;
  onMediaOptionClick: (mediaOption: MediaOption) => void;
  setSelectedDevices: (selectedDevices: SelectedDevices) => void;
  saveAudioFilter: (audioFilter: AudioFilter) => void;
  startMediaStream: () => void;
  stopMediaStream: () => void;
}

const DeviceContext = createContext<ContextProps>({
  isReady: false,
  selectedDevices: null,
  selectedAudioFilter: null,
  mediaOptions: DEFAULT_MEDIA_OPTIONS,
  localMediaStream: null,
  onMediaOptionClick: () => {},
  setSelectedDevices: () => {},
  saveAudioFilter: () => {},
  startMediaStream: () => {},
  stopMediaStream: () => {},
});

interface Props {
  children: ReactNode;
}

export const DeviceProvider: React.FC<Props> = ({ children }) => {
  const [mediaOptions, setMediaOptions] = useState<MediaOptions>(DEFAULT_MEDIA_OPTIONS);
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevices | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [filteredMediaStream, setFilteredMediaStream] = useState<MediaStream | null>(null);
  const [selectedAudioFilter, setAudioFilter] = useState<AudioFilter | null>(null);
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();
  console.log(router.pathname);

  const showFilteredStream = selectedAudioFilter && selectedAudioFilter?.label !== 'None';

  const onMediaOptionClick = (mediaOption: MediaOption) => {
    setMediaOptions({ ...mediaOptions, [mediaOption]: !mediaOptions[mediaOption] });
  };

  useEffect(() => {
    const getMediaDevices = async () => {
      const audioConstraints = {
        audio: selectedDevices?.audioDeviceId ? { deviceId: selectedDevices.audioDeviceId } : true,
      };
      const videoConstraints = {
        video: selectedDevices?.videoDeviceId ? { deviceId: selectedDevices.videoDeviceId } : true,
      };
      const mediaConstraints = { ...audioConstraints, ...videoConstraints };
      const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setLocalMediaStream(mediaStream);
    };
    if (router.pathname === CHAT_ROOM_PATH) {
      getMediaDevices();
    }
  }, [selectedDevices?.audioDeviceId, selectedDevices?.videoDeviceId, router.pathname]);

  useEffect(() => {
    if (router.pathname !== CHAT_ROOM_PATH) {
      stopMediaStream();
    }
  }, [router.pathname]);

  useEffect(() => {
    if (localMediaStream) {
      localMediaStream.getAudioTracks()[0].enabled = mediaOptions.audio;
    }
  }, [mediaOptions.audio, localMediaStream]);

  useEffect(() => {
    if (localMediaStream) {
      localMediaStream.getVideoTracks()[0].enabled = mediaOptions.video;
    }
  }, [mediaOptions.video, localMediaStream]);

  const startMediaStream = () => {
    setIsReady(true);
  };

  const stopMediaStream = () => {
    if (localMediaStream) {
      localMediaStream.getTracks().forEach((track) => track.stop());
    }
    if (filteredMediaStream) {
      filteredMediaStream.getTracks().forEach((track) => track.stop());
    }
  };

  const saveAudioFilter = (audioFilter: AudioFilter) => {
    if (localMediaStream && audioFilter?.transform) {
      const filteredMediaStream = audioFilter.transform(localMediaStream);
      const videoTracks = localMediaStream.getVideoTracks();
      videoTracks.forEach((track) => {
        filteredMediaStream.addTrack(track);
      });
      setFilteredMediaStream(filteredMediaStream);
    }
    setAudioFilter(audioFilter);
  };

  return (
    <DeviceContext.Provider
      value={{
        isReady,
        selectedDevices,
        selectedAudioFilter,
        mediaOptions,
        localMediaStream: filteredMediaStream ?? localMediaStream,
        onMediaOptionClick,
        setSelectedDevices,
        saveAudioFilter,
        startMediaStream,
        stopMediaStream,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export function useDeviceProviderContext(): ContextProps {
  const context = React.useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDeviceProviderContext must be used within Device Provider');
  }
  return context;
}
