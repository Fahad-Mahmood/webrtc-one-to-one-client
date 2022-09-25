import { Box } from '@mui/material';
import { CallEnd } from '@mui/icons-material';
import { useCallProviderContext } from '../../providers/CallProvider';

export const CallSettings = () => {
  const { onEndCall } = useCallProviderContext();

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 30,
        bgcolor: 'primary.main',
        width: 200,
        height: 60,
        borderRadius: 25,
        left: 30,
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        onClick={onEndCall}
        sx={{
          '&:hover': { opacity: 0.7 },
          cursor: 'pointer',
          width: 50,
          height: 40,
          bgcolor: 'error.main',
          display: 'flex',
          justifyContent: 'center',
          borderRadius: '50%',
          alignItems: 'center',
        }}
      >
        <CallEnd sx={{ color: 'white' }} />
      </Box>
    </Box>
  );
};
