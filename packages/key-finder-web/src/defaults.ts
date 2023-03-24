const customSettings = JSON.parse(localStorage.getItem('customSettings'));

const majorKeys = [
  'C Major',
  'G Major',
  'D Major',
  'A Major',
  'E Major',
  'B Major',
  'Gb Major',
  'Db Major',
  'Ab Major',
  'Eb Major',
  'Bb Major',
  'F Major',
];

const minorKeys = [
  'A Minor',
  'E Minor',
  'B Minor',
  'Gb Minor',
  'Db Minor',
  'Ab Minor',
  'Eb Minor',
  'Bb Minor',
  'F Minor',
  'C Minor',
  'G Minor',
  'D Minor',
];

const defaultKeysNotation = {
  'C Major': 'C',
  'G Major': 'G',
  'D Major': 'D',
  'A Major': 'A',
  'E Major': 'E',
  'B Major': 'B',
  'Gb Major': 'G♭',
  'Db Major': 'D♭',
  'Ab Major': 'A♭',
  'Eb Major': 'E♭',
  'Bb Major': 'B♭',
  'F Major': 'F',
  'A Minor': 'Am',
  'E Minor': 'Em',
  'B Minor': 'Bm',
  'Gb Minor': 'G♭m',
  'Db Minor': 'D♭m',
  'Ab Minor': 'A♭m',
  'Eb Minor': 'E♭m',
  'Bb Minor': 'B♭m',
  'F Minor': 'Fm',
  'C Minor': 'Cm',
  'G Minor': 'Gm',
  'D Minor': 'Dm',
};
const keysNotation =
  customSettings && customSettings.keysNotation
    ? customSettings.keysNotation
    : defaultKeysNotation;

const defaultTheme = 'light';
const theme =
  customSettings && customSettings.theme ? customSettings.theme : defaultTheme;

const defaultKeyAtTopPosition = 'C Major';
const keyAtTopPosition =
  customSettings && customSettings.keyAtTopPosition
    ? customSettings.keyAtTopPosition
    : defaultKeyAtTopPosition;

const maxNumberOfThreads = navigator.hardwareConcurrency;
const defaultNumberOfThreads = navigator.hardwareConcurrency - 1;
const numberOfThreads =
  customSettings && customSettings.numberOfThreads
    ? customSettings.numberOfThreads
    : defaultNumberOfThreads || 1;

export {
  majorKeys,
  minorKeys,
  keysNotation,
  theme,
  keyAtTopPosition,
  maxNumberOfThreads,
  numberOfThreads,
};
