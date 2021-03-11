import { h, createRef, Fragment, Component } from 'preact';

const HORIZONTAL_OFFSET = 500;
const BORDER_RADIUS = 270;
const BORDER_THICKNESS = 2;
const BORDER_COLOR = '#aaa';
const OUTER_RADIUS = 240;
const INNER_RING_OFFSET = 25;
const INNER_RADIUS = 160;
const NOTE_WIDTH = 55;
const INNERMOST_RADIUS = 115;
const PRIMARY_COLOR = '#008DD5';
const WHITE_COLOR = '#FFF';

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

const InnerSemiCircle = ({ backgroundColor, angleOffset }) => (
  <div
    style={{
      position: 'absolute',
      transform: `rotate(${angleOffset}deg)`,
      transformOrigin: 'bottom center',
      height: `${(INNER_RADIUS + INNER_RING_OFFSET)}px`,
      width: `${(INNER_RADIUS + INNER_RING_OFFSET) * 2}px`,
      top: `${BORDER_RADIUS - (INNER_RADIUS + INNER_RING_OFFSET)}px`,
      left: `${HORIZONTAL_OFFSET - (INNER_RADIUS + INNER_RING_OFFSET)}px`,
      border: `${OUTER_RADIUS - INNER_RADIUS}px solid ${backgroundColor}`,
      borderTopLeftRadius: `${(INNER_RADIUS + INNER_RING_OFFSET) * 2}px`,
      borderTopRightRadius: `${(INNER_RADIUS + INNER_RING_OFFSET) * 2}px`,
      borderBottom: 'none',
    }}
  />
)

const OuterSemiCircle = ({ backgroundColor, angleOffset }) => (
  <div
    style={{
      position: 'absolute',
      transform: `rotate(${angleOffset}deg)`,
      transformOrigin: 'bottom center',
      height: `${(BORDER_RADIUS)}px`,
      width: `${BORDER_RADIUS * 2}px`,
      left: `${HORIZONTAL_OFFSET - (BORDER_RADIUS)}px`,
      border: `${BORDER_RADIUS - (INNER_RADIUS + INNER_RING_OFFSET)}px solid ${backgroundColor}`,
      borderTopLeftRadius: `${(BORDER_RADIUS) * 2}px`,
      borderTopRightRadius: `${(BORDER_RADIUS) * 2}px`,
      borderBottom: 'none',
    }}
  />
)

const SemiCircleHighlight = ({ result }) => {
  const majorKeyIndex = majorKeys.findIndex(major => Object.keys(major).some(key => key === result));
  const minorKeyIndex = minorKeys.findIndex(minor => Object.keys(minor).some(key => key === result));
  if (majorKeyIndex >= 0) {
    return (
      <>
        <OuterSemiCircle backgroundColor={PRIMARY_COLOR} angleOffset={majorKeyIndex * 30 - (90 - 15)} />
        <OuterSemiCircle backgroundColor={WHITE_COLOR} angleOffset={(majorKeyIndex - 1) * 30 - (90 - 15)} />
      </>
    );
  } else if (minorKeyIndex >= 0) {
    return (
      <>
        <InnerSemiCircle backgroundColor={PRIMARY_COLOR} angleOffset={minorKeyIndex * 30 - (90 - 15)} />
        <InnerSemiCircle backgroundColor={WHITE_COLOR} angleOffset={(minorKeyIndex - 1) * 30 - (90 - 15)} />
      </>
    );
  }
  return null;
};

class CircleOfFifths extends Component<({ result?: string })> {
  render() {
    return (
      <div
        style={{
          width: '1000px',
        }}
      >
        <div style={{position: 'relative' }}>
          <SemiCircleHighlight result={this.props.result} />
          {majorKeys.map((major, index) =>
            Object.entries(major).map(([key, value]) => (
              <>
                <div style={{
                       top: `${BORDER_RADIUS - OUTER_RADIUS}px`,
                       left: `${HORIZONTAL_OFFSET - NOTE_WIDTH / 2}px`,
                       height: `${OUTER_RADIUS}px`,
                       width: `${NOTE_WIDTH}px`,
                       transform: `rotate(${index * 30}deg)`,
                       transformOrigin: 'bottom center',
                       position: 'absolute',
                     }}>
                  <div
                    style={{
                      textAlign: 'center',
                      transform: `rotate(${-index * 30}deg)`,
                      fontWeight: 'bold'
                    }}
                  >
                    {value}
                  </div>
                </div>
                <div
                  style={{
                    left: `${HORIZONTAL_OFFSET - BORDER_THICKNESS / 2}px`,
                    width: `${BORDER_THICKNESS}px`,
                    height: `${BORDER_RADIUS}px`,
                    backgroundColor: `${BORDER_COLOR}`,
                    transform: `rotate(${index * 30 - 15}deg)`,
                    transformOrigin: 'bottom center',
                    position: 'absolute',
                  }}
                />
              </>
            ))
          )}
          {minorKeys.map((minor, index) =>
            Object.entries(minor).map(([key, value]) => (
              <div
                style={{
                  width: `${NOTE_WIDTH}px`,
                  textAlign: 'center',
                  top: `${(BORDER_RADIUS - INNER_RADIUS)}px`,
                  left: `${HORIZONTAL_OFFSET - NOTE_WIDTH / 2}px`,
                  height: `${INNER_RADIUS}px`,
                  transform: `rotate(${index * 30}deg)`,
                  transformOrigin: 'bottom center',
                  position: 'absolute',
                }}
              >
                <div
                  style={{
                    transform: `rotate(${-index * 30}deg)`,
                    fontSize: "0.8rem"
                  }}
                >
                  {value}
                </div>
              </div>
            ))
          )}
          <div
            style={{
              position: 'absolute',
              borderRadius: `${BORDER_RADIUS}px`,
              border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
              height: `${BORDER_RADIUS * 2}px`,
              width: `${BORDER_RADIUS * 2}px`,
              left: `${HORIZONTAL_OFFSET - BORDER_RADIUS}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              borderRadius: `${BORDER_RADIUS}px`,
              border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
              height: `${(INNER_RADIUS + INNER_RING_OFFSET) * 2}px`,
              width: `${(INNER_RADIUS + INNER_RING_OFFSET) * 2}px`,
              top: `${BORDER_RADIUS - (INNER_RADIUS + INNER_RING_OFFSET)}px`,
              left: `${HORIZONTAL_OFFSET - (INNER_RADIUS + INNER_RING_OFFSET)}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              borderRadius: `${BORDER_RADIUS}px`,
              border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
              height: `${INNERMOST_RADIUS * 2}px`,
              width: `${INNERMOST_RADIUS * 2}px`,
              top: `${BORDER_RADIUS - INNERMOST_RADIUS}px`,
              left: `${HORIZONTAL_OFFSET - INNERMOST_RADIUS}px`,
              backgroundColor: `${WHITE_COLOR}`,
            }}
          />
        </div>
      </div>
    );
  }
}

export default CircleOfFifths;
