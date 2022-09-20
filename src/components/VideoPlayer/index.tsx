import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';

interface PlayerProps {
  isMirrored: boolean;
}

const StyledVideo = styled.video<PlayerProps>`
  height: 100%;
  width: 100%;
  object-fit: cover;
  transform: ${(props) => (props.isMirrored ? 'scale(-1, 1)' : 'initial')};
`;

interface Props {
  stream: MediaStream | null;
  isMuted?: boolean;
  isMirrored?: boolean;
}

export const VideoPlayer: React.FC<Props> = ({ stream, isMuted = false, isMirrored = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (stream && videoRef?.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return <StyledVideo autoPlay muted={isMuted} ref={videoRef} isMirrored={isMirrored} />;
};
