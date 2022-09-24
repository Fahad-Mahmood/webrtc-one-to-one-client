type MediaOption = 'audio' | 'video';

interface MediaOptions {
  audio: boolean;
  video: boolean;
}

interface SelectedDevices {
  audioDeviceId?: string;
  videoDeviceId?: string;
}
interface ShimPeerConnection extends RTCPeerConnection {
  onaddstream: unknown;
  onremovestream: unknown;
  addStream: unknown;
}

interface AudioFilter {
  id: number;
  label: string;
  transform?: (sourceMedia: MediaStream) => MediaStream;
}
