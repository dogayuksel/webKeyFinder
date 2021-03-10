import { h, createRef, Fragment, Component } from 'preact';

const HEIGHT = 500;
const INNER_HEIGHT = 340;

const majorKeys = [
  {"C Major": "C" },
  {"G Major": "G" },
  {"D Major": "D" },
  {"A Major": "A" },
  {"E Major": "E" },
  {"B Major": "B" },
  {"Gb Major": "Gb" },
  {"Db Major": "Db" },
  {"Ab Major": "Ab" },
  {"Eb Major": "Eb" },
  {"Bb Major": "Bb" },
  {"F Major": "F" },
];

const minorKeys = [
  { "A Minor": "Am" },
  { "E Minor": "Em" },
  { "B Minor": "Bm" },
  { "Gb Minor": "Gbm" },
  { "Db Minor": "Dbm" },
  { "Ab Minor": "Abm" },
  { "Eb Minor": "Ebm" },
  { "Bb Minor": "Bbm" },
  { "F Minor": "Fm" },
  { "C Minor": "Cm" },
  { "G Minor": "Gm" },
  { "D Minor": "Dm" },
];

class CircleOfFifths extends Component<({ result?: string })> {
  render() {
    return (
      <div
        style={{
          width: '1000px',
        }}
      >
        <div style={{position: 'relative' }}>
          {majorKeys.map((major, index) =>
            Object.entries(major).map(([key, value]) => (
              <div style={{
                     left: `${HEIGHT}px`,
                     height: `${HEIGHT / 2}px`,
                     transform: `rotate(${index * 30}deg)`,
                     transformOrigin: 'bottom center',
                     position: 'absolute',
                   }}>
                <div
                  style={{
                    padding: '0.2em',
                    backgroundColor: key === this.props.result ? '#008DD5' : '#fff',
                    borderRadius: '0.1em',
                    transform: `rotate(${-index * 30}deg)`,
                    fontWeight: 'bold'
                  }}
                >
                  {value}
                </div>
              </div>
            ))
          )}
          {minorKeys.map((minor, index) =>
            Object.entries(minor).map(([key, value]) => (
              <div
                style={{
                  top: `${(HEIGHT - INNER_HEIGHT) / 2}px`,
                  left: `${HEIGHT}px`,
                  height: `${INNER_HEIGHT / 2}px`,
                  transform: `rotate(${index * 30}deg)`,
                  transformOrigin: 'bottom center',
                  position: 'absolute',
                }}
              >
                <div
                  style={{
                    padding: '0.2em',
                    backgroundColor: key === this.props.result ? '#008DD5' : '#fff',
                    borderRadius: '0.1em',
                    transform: `rotate(${-index * 30}deg)`,
                    fontSize: "0.8rem"
                  }}
                >
                  {value}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}

export default CircleOfFifths;
