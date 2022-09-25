import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Theme, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { AUDIO_FILTERS } from '../../utils/audioFilters';
import { useDeviceProviderContext } from '../../providers/DeviceProvider';

const MODAL_TITLE = 'Device Settings';
const AUDIO_DEVICE_KIND = 'audioinput';
const VIDEO_DEVICE_KIND = 'videoinput';
const AUDIO_SELECT_HEADING = 'Audio';
const VIDEO_SELECT_HEADING = 'Video';
const AUDIO_SELECT_LABEL = 'Audio Select';
const VIDEO_SELECT_LABEL = 'Video Select';
const CANCEL_BTN_TEXT = 'Cancel';
const SAVE_BTN_TEXT = 'Save';
const VOICE_FILTER_HEADING = 'Voice Filters';
const VOICE_FILTER_SELECT_LABEL = 'Filter Select';

const getModalStyles = (theme: Theme) => ({
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  [theme.breakpoints.down('sm')]: {
    width: 300,
  },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<MediaDeviceInfo | null>(null);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<MediaDeviceInfo | null>(null);
  const [currentSelectedAudioFilter, setSelectedAudioFilter] = useState<AudioFilter | null>(null);

  const { selectedDevices, selectedAudioFilter, setSelectedDevices, setAudioFilter } = useDeviceProviderContext();

  const audioDevices = useMemo(
    () => availableDevices?.filter((mediaDevice) => mediaDevice.kind === AUDIO_DEVICE_KIND) ?? [],
    [availableDevices],
  );
  const videoDevices = useMemo(
    () => availableDevices?.filter((mediaDevice) => mediaDevice.kind === VIDEO_DEVICE_KIND) ?? [],
    [availableDevices],
  );

  const defaultAudioDeviceIndex = useMemo(
    () =>
      selectedDevices?.audioDeviceId && audioDevices
        ? audioDevices.findIndex((audioDevice) => audioDevice.deviceId === selectedDevices.audioDeviceId)
        : 0,
    [selectedDevices, audioDevices],
  );
  const defaultVideoDeviceIndex = useMemo(
    () =>
      selectedDevices?.videoDeviceId && videoDevices
        ? videoDevices.findIndex((videoDevice) => videoDevice.deviceId === selectedDevices.videoDeviceId)
        : 0,
    [selectedDevices, videoDevices],
  );

  const defaultAudioFilerIndex = useMemo(
    () =>
      selectedAudioFilter ? AUDIO_FILTERS.findIndex((audioFilter) => audioFilter.id === selectedAudioFilter.id) : 0,
    [selectedAudioFilter],
  );

  useEffect(() => {
    const listDevices = async () => {
      let devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableDevices(devices);
    };
    listDevices();
  }, []);

  const onAudioSelect = (e: SelectChangeEvent<number>) => {
    const value = e.target.value as number;
    setSelectedAudioDevice(audioDevices[value]);
  };

  const onVideoSelect = (e: SelectChangeEvent<number>) => {
    const value = e.target.value as number;
    setSelectedVideoDevice(videoDevices[value]);
  };

  const onAudioFilterSelect = (e: SelectChangeEvent<number>) => {
    const value = e.target.value as number;
    setSelectedAudioFilter(AUDIO_FILTERS[value]);
  };

  const onSave = () => {
    const selectedDevices = {
      audioDeviceId: selectedAudioDevice?.deviceId,
      videoDeviceId: selectedVideoDevice?.deviceId,
    };

    if (selectedDevices) {
      setSelectedDevices(selectedDevices);
    }
    if (currentSelectedAudioFilter) {
      setSelectedAudioFilter(currentSelectedAudioFilter);
    }

    onClose();
  };

  return (
    <div>
      <Modal
        open={isOpen}
        onClose={() => onClose()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={getModalStyles(theme)}>
          <Typography sx={{ mb: 2 }} id="modal-modal-title" variant="h4" component="h2">
            {MODAL_TITLE}
          </Typography>
          <Grid container direction="row" justifyContent="space-between" alignItems="center" my={2}>
            <Typography variant="h6">{AUDIO_SELECT_HEADING}</Typography>
            <FormControl sx={{ width: 200 }}>
              <InputLabel id="audio-select">{AUDIO_SELECT_LABEL}</InputLabel>
              <Select
                id="audio-select"
                defaultValue={defaultAudioDeviceIndex}
                label="Audio Select"
                onChange={onAudioSelect}
              >
                {audioDevices.map((audioDevice, index) => (
                  <MenuItem key={audioDevice.deviceId} value={index}>
                    {audioDevice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid container direction="row" justifyContent="space-between" alignItems="center" my={2}>
            <Typography variant="h6">{VIDEO_SELECT_HEADING}</Typography>
            <FormControl sx={{ width: 200 }}>
              <InputLabel id="video-select">{VIDEO_SELECT_LABEL}</InputLabel>
              <Select
                id="video-select"
                defaultValue={defaultAudioFilerIndex}
                label="Video Select"
                onChange={onVideoSelect}
              >
                {videoDevices.map((videoDevice, index) => (
                  <MenuItem key={videoDevice.deviceId} value={index}>
                    {videoDevice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid container direction="row" justifyContent="space-between" alignItems="center" my={2}>
            <Typography variant="h6">{VOICE_FILTER_HEADING}</Typography>
            <FormControl sx={{ width: 200 }}>
              <InputLabel id="video-select">{VOICE_FILTER_SELECT_LABEL}</InputLabel>
              <Select
                id="video-select"
                defaultValue={defaultVideoDeviceIndex}
                label="Video Select"
                onChange={onAudioFilterSelect}
              >
                {AUDIO_FILTERS.map((audioFilter, index) => (
                  <MenuItem key={audioFilter.id} value={index}>
                    {audioFilter.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Button onClick={() => onClose()} variant="contained" sx={{ mr: 2 }}>
            {CANCEL_BTN_TEXT}
          </Button>
          <Button onClick={onSave} variant="contained">
            {SAVE_BTN_TEXT}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
