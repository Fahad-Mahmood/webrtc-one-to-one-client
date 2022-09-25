import { Grid, Box } from '@mui/material';
import { VideoPlayer } from '../VideoPlayer';
import { ROOM_STATUS, useCallProviderContext } from '../../providers/CallProvider';
import { RoomStateOverlay } from '../RoomStateOverlay';
import { CallSettings } from '../CallSettings';
import { useDeviceProviderContext } from '../../providers/DeviceProvider';

export const ChatRoom: React.FC = () => {
  const { remoteMediaStream, roomState } = useCallProviderContext();
  const { localMediaStream } = useDeviceProviderContext();

  return (
    <Grid container sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Grid
        container
        direction={'column'}
        justifyContent={'center'}
        alignItems="center"
        sx={{ height: '100%', width: '100%', bgcolor: 'grey.900' }}
      >
        {roomState === ROOM_STATUS.connected && remoteMediaStream ? (
          <VideoPlayer stream={remoteMediaStream} />
        ) : (
          <RoomStateOverlay />
        )}
      </Grid>
      {roomState === ROOM_STATUS.connected ? <CallSettings /> : null}
      {roomState !== ROOM_STATUS.ended && roomState !== ROOM_STATUS.rejected ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            height: [80, 200],
            width: [100, 300],
            bgcolor: 'black',
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
          }}
        >
          <VideoPlayer stream={localMediaStream} isMuted={true} isMirrored={true} />
        </Box>
      ) : null}
    </Grid>
  );
};
