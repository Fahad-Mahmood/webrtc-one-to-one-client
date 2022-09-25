import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { Theme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Call, CheckCircle, Cancel, Router } from '@mui/icons-material';
import { ROOM_STATUS, useCallProviderContext } from '../../providers/CallProvider';

const WAITING_TEXT = 'Waiting for Participant';
const START_CALL = 'Call Participant';
const CALLING_TEXT = ' is calling you.';
const CONNECTING_TEXT = 'Setting Up Call';
const CALL_DECLINED_TEXT = 'Call Declined';
const CALL_ENDED_TEXT = 'Call Ended';
const HOVER_STYLES = { '&:hover': { opacity: 0.7 }, cursor: 'pointer' };

const Pulse = keyframes`
0% {
  transform: scale(0.5);
  opacity: 0
}

50% {
  transform: scale(1);
  opacity: 1
}

100% {
  transform: scale(1.3);
  opacity: 0
}
`;

const CallingBox = styled(Box)(({ theme }: { theme?: Theme }) => ({
  height: 140,
  width: 140,
  position: 'relative',
  backgroundColor: `${theme?.palette.primary.main}`,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:before': {
    content: '""',
    position: 'absolute',
    border: `1px solid ${theme?.palette.primary.main}`,
    width: 'calc(100% + 40px)',
    height: 'calc(100% + 40px)',
    borderRadius: '50%',
    animation: `${Pulse} 1s linear infinite`,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    border: `1px solid ${theme?.palette.primary.main}`,
    width: 'calc(100% + 40px)',
    height: 'calc(100% + 40px)',
    borderRadius: '50%',
    animation: `${Pulse} 1s linear infinite`,
    animationDelay: '0.3s',
  },
}));

export const RoomStateOverlay = () => {
  const { memberName, roomState, onStartCall, onAnswerCall } = useCallProviderContext();
  const router = useRouter();
  const onBackClick = () => {
    router.push('/');
  };
  if (roomState === ROOM_STATUS.canCall) {
    return (
      <>
        <Call onClick={onStartCall} color="primary" sx={{ mb: 2, fontSize: 50, ...HOVER_STYLES }} />
        <Typography letterSpacing={1} variant="h6" color="white">
          {START_CALL}
        </Typography>
      </>
    );
  } else if (roomState === ROOM_STATUS.calling) {
    return (
      <>
        <CallingBox>
          <Call sx={{ fontSize: 50, color: 'white' }} />
        </CallingBox>
      </>
    );
  } else if (roomState === ROOM_STATUS.ringing) {
    return (
      <>
        <Typography mb={6} letterSpacing={1} variant="h6" color="white">
          {`${memberName}${CALLING_TEXT}`}
        </Typography>
        <CallingBox>
          <Call sx={{ fontSize: 50, color: 'white' }} />
        </CallingBox>
        <Grid mt={6} container width={200} justifyContent={'space-between'} alignItems="center">
          <Cancel onClick={() => onAnswerCall(false)} color="error" sx={{ fontSize: 50, ...HOVER_STYLES }} />
          <CheckCircle onClick={() => onAnswerCall(true)} color="success" sx={{ fontSize: 50, ...HOVER_STYLES }} />
        </Grid>
      </>
    );
  } else if (roomState === ROOM_STATUS.connecting) {
    return (
      <Typography variant="h6" color="white">
        {CONNECTING_TEXT}
      </Typography>
    );
  } else if (roomState === ROOM_STATUS.rejected || roomState === ROOM_STATUS.ended) {
    return (
      <>
        <Typography mb={4} variant="h6" color="white">
          {roomState === ROOM_STATUS.rejected ? CALL_DECLINED_TEXT : CALL_ENDED_TEXT}
        </Typography>
        <Button onClick={onBackClick} variant="contained">
          Join Another Room
        </Button>
      </>
    );
  }

  return (
    <Typography variant="h6" color="white">
      {WAITING_TEXT}
    </Typography>
  );
};
