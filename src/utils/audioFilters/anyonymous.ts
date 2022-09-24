import { makeDistortionCurve } from './makeDistortionCurve';

export function anonymousTransformFilter(sourceMedia: MediaStream, distortionAmount = 100) {
  const isAudioTrack = sourceMedia.getAudioTracks().length > 0;
  if (isAudioTrack) {
    const ctx = new AudioContext();
    let sourceNode = ctx.createMediaStreamSource(sourceMedia);
    // Wave shaper
    let waveShaper = ctx.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(distortionAmount);
    // Wobble
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = 50;
    oscillator.type = 'sawtooth';
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = 0.005;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.01;

    // White noise
    let noise = ctx.createBufferSource();
    let noiseBuffer = ctx.createBuffer(1, 32768, ctx.sampleRate);
    let noiseData = noiseBuffer.getChannelData(0);
    for (var i = 0; i < 32768; i++) {
      noiseData[i] =
        Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * 0.6;
    }
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Create graph
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    sourceNode.connect(delay);
    delay.connect(waveShaper);

    const destinationNode = ctx.createMediaStreamDestination();
    waveShaper.connect(destinationNode);
    noise.connect(destinationNode);
    oscillator.start(0);
    noise.start(0);
    return destinationNode.stream;
  }
  return sourceMedia;
}
