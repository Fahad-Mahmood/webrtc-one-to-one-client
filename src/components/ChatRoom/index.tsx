import { Grid, Box } from '@mui/material';
import { VideoPlayer } from '../VideoPlayer';
import { useCallProviderContext } from '../../providers/CallProvider';
import { RoomStateOverlay } from '../RoomStateOverlay';

interface Props {
  localMediaStream: MediaStream | null;
}

export const ChatRoom: React.FC<Props> = ({ localMediaStream }) => {
  const { remoteMediaStream } = useCallProviderContext();
  return (
    <Grid container sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Grid
        container
        direction={'column'}
        justifyContent={'center'}
        alignItems="center"
        sx={{ height: '100%', width: '100%', bgcolor: 'grey.900' }}
      >
        {remoteMediaStream ? <VideoPlayer stream={remoteMediaStream} /> : <RoomStateOverlay />}
      </Grid>
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
    </Grid>
  );
};
