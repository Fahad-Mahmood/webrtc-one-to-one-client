import { anonymousTransformFilter, robotTransformFilter, astronautTransformFilter } from './';

export const AUDIO_FILTERS: AudioFilter[] = [
  { id: 1, label: 'None' },
  { id: 2, label: 'Anonymous', transform: anonymousTransformFilter },
  { id: 3, label: 'Astronaut', transform: astronautTransformFilter },
  { id: 4, label: 'Robot', transform: robotTransformFilter },
];
