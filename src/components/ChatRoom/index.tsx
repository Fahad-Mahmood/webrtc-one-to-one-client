import { Grid, Box, Typography } from '@mui/material';
import { VideoPlayer } from '../VideoPlayer';
import { useCallProviderContext } from '../../providers/CallProvider';

interface Props {
  localMediaStream: MediaStream | null;
}

const WAITING_TEXT = 'Waiting For Participant';

export const ChatRoom: React.FC<Props> = ({ localMediaStream }) => {
  const { remoteMediaStream } = useCallProviderContext();
  return (
    <Grid container sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Grid
        container
        justifyContent={'center'}
        alignItems="center"
        sx={{ height: '100%', width: '100%', bgcolor: 'grey.900' }}
      >
        {remoteMediaStream ? (
          <VideoPlayer stream={remoteMediaStream} />
        ) : (
          <Typography variant="h6" color="white">
            {WAITING_TEXT}
          </Typography>
        )}
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
