type MediaOption = 'audio' | 'video';

interface MediaOptions {
  audio: boolean;
  video: boolean;
}

interface SelectedDevices {
  audioDeviceId?: string;
  videoDeviceId?: string;
}
