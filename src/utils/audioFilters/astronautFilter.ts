import { makeDistortionCurve } from './makeDistortionCurve';

export function astronautTransformFilter(sourceMedia: MediaStream, distortionAmount = 50) {
  const isAudioTrack = sourceMedia.getAudioTracks().length > 0;
  if (isAudioTrack) {
    const ctx = new AudioContext();
    let sourceNode = ctx.createMediaStreamSource(sourceMedia);
    // Wave shaper
    let waveShaper = ctx.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(distortionAmount);

    // Filter
    let filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1300;

    // Initial distortion
    sourceNode.connect(filter);
    filter.connect(waveShaper);

    // Telephone effect
    let lpf1 = ctx.createBiquadFilter();
    lpf1.type = 'lowpass';
    lpf1.frequency.value = 2000.0;
    let lpf2 = ctx.createBiquadFilter();
    lpf2.type = 'lowpass';
    lpf2.frequency.value = 2000.0;
    let hpf1 = ctx.createBiquadFilter();
    hpf1.type = 'highpass';
    hpf1.frequency.value = 500.0;
    let hpf2 = ctx.createBiquadFilter();
    hpf2.type = 'highpass';
    hpf2.frequency.value = 500.0;
    let compressor = ctx.createDynamicsCompressor();
    lpf1.connect(lpf2);
    lpf2.connect(hpf1);
    hpf1.connect(hpf2);
    hpf2.connect(compressor);
    compressor.connect(ctx.destination);

    // Connect distorter to telephone effect
    waveShaper.connect(lpf1);

    const destinationNode = ctx.createMediaStreamDestination();
    compressor.connect(destinationNode);
    return destinationNode.stream;
  }
  return sourceMedia;
}
