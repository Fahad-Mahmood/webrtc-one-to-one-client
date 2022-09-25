import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';

const DEFAULT_MEDIA_OPTIONS = { audio: false, video: false };

interface ContextProps {
  selectedDevices: SelectedDevices | null;
  selectedAudioFilter: AudioFilter | null;
  mediaOptions: MediaOptions;
  localMediaStream: MediaStream | null;
  onMediaOptionClick: (mediaOption: MediaOption) => void;
  setSelectedDevices: (selectedDevices: SelectedDevices) => void;
  setAudioFilter: (audioFilter: AudioFilter) => void;
  startMediaStream: () => void;
}

const DeviceContext = createContext<ContextProps>({
  selectedDevices: null,
  selectedAudioFilter: null,
  mediaOptions: DEFAULT_MEDIA_OPTIONS,
  localMediaStream: null,
  onMediaOptionClick: () => {},
  setSelectedDevices: () => {},
  setAudioFilter: () => {},
  startMediaStream: () => {},
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

  const showFilteredStream = selectedAudioFilter && selectedAudioFilter?.label !== 'None';

  const onMediaOptionClick = (mediaOption: MediaOption) => {
    setMediaOptions({ ...mediaOptions, [mediaOption]: !mediaOptions[mediaOption] });
  };

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

  const startMediaStream = () => {
    if (localMediaStream && selectedAudioFilter?.transform) {
      setFilteredMediaStream(selectedAudioFilter.transform(localMediaStream));
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        selectedDevices,
        selectedAudioFilter,
        mediaOptions,
        localMediaStream: showFilteredStream ? filteredMediaStream : localMediaStream,
        onMediaOptionClick,
        setSelectedDevices,
        setAudioFilter,
        startMediaStream,
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
