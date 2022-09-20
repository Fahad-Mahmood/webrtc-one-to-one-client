import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useMemo } from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';

const PAGE_TITLE = 'WebRTC Ventures 1:1';
const JOIN_ROOM_TEXT = 'Join a Room';
const INPUT_PLACEHOLDER = 'Type Room Name!';
const JOIN_BTN_TEXT = 'Join';

const Home: NextPage = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState<string>('');
  const isJoinDisabled = useMemo(() => roomName.trim() === '', [roomName]);

  const onRoomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const onJoinClick = () => {
    if (!isJoinDisabled) {
      router.push(`/room/${roomName}`);
    }
  };

  return (
    <div>
      <Head>
        <title>{PAGE_TITLE}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100vh', bgcolor: 'grey.200' }}
        >
          <Typography align="center" py={4} fontWeight="400" variant="h1">
            {JOIN_ROOM_TEXT}
          </Typography>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ py: 4, width: '100%', flexDirection: ['column', 'row'] }}
          >
            <TextField
              onChange={onRoomInput}
              sx={{ width: '70%', maxWidth: 800, mr: 2 }}
              placeholder={INPUT_PLACEHOLDER}
            />
            <Button
              sx={{ mt: [4, 0] }}
              onClick={onJoinClick}
              disabled={isJoinDisabled}
              size="large"
              variant="contained"
            >
              {JOIN_BTN_TEXT}
            </Button>
          </Grid>
        </Grid>
      </main>
    </div>
  );
};

export default Home;
