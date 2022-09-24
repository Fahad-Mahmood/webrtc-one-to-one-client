export function robotTransformFilter(sourceMedia: MediaStream) {
  const isAudioTrack = sourceMedia.getAudioTracks().length > 0;
  if (isAudioTrack) {
    const ctx = new AudioContext();
    let sourceNode = ctx.createMediaStreamSource(sourceMedia);
    // Wobble
    let oscillator1 = ctx.createOscillator();
    oscillator1.frequency.value = 50;
    oscillator1.type = 'sawtooth';
    let oscillator2 = ctx.createOscillator();
    oscillator2.frequency.value = 500;
    oscillator2.type = 'sawtooth';
    let oscillator3 = ctx.createOscillator();
    oscillator3.frequency.value = 50;
    oscillator3.type = 'sawtooth';
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = 0.004;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.01;

    // Create graph
    oscillator1.connect(oscillatorGain);
    oscillator2.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    sourceNode.connect(delay);
    const destinationNode = ctx.createMediaStreamDestination();
    delay.connect(destinationNode);
    oscillator1.start(0);
    oscillator2.start(0);
    return destinationNode.stream;
  }
  return sourceMedia;
}
