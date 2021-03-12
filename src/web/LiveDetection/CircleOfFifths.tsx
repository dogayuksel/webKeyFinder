import { h, createRef, Fragment, Component } from 'preact';
import {
  majorKeys,
  minorKeys,
  keysNotation,
  keyAtTopPosition,
} from '../defaults';

const HORIZONTAL_OFFSET = 500;
const BORDER_RADIUS = 270;
const BORDER_THICKNESS = 2;
const BORDER_COLOR = '#C0C1C1';
const OUTER_RADIUS = 240;
const INNER_RING_OFFSET = 25;
const INNER_RADIUS = 160;
const MAJOR_NOTE_WIDTH = 120;
const MINOR_NOTE_WIDTH = 90;
const INNERMOST_RADIUS = 115;
const PRIMARY_COLOR = '#FF6801';
const WHITE_COLOR = '#EBECEC';

const InnerSemiCircle = ({ backgroundColor, angleOffset, opacity }) => (
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
      opacity: opacity,
    }}
  />
)

const OuterSemiCircle = ({ backgroundColor, angleOffset, opacity }) => (
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
      opacity: opacity,
    }}
  />
)

const SemiCircleHighlight = ({ result, offset }) => {
  const majorKeyIndex = majorKeys.findIndex(key => key === result);
  const minorKeyIndex = minorKeys.findIndex(key => key === result);
  if (majorKeyIndex >= 0) {
    return (
      <>
        <OuterSemiCircle
          opacity={0.6}
          backgroundColor={PRIMARY_COLOR}
          angleOffset={(majorKeyIndex + offset) * 30 - (90 - 15)}
        />
        <OuterSemiCircle
          opacity={1}
          backgroundColor={WHITE_COLOR}
          angleOffset={(majorKeyIndex + offset - 1) * 30 - (90 - 15)}
        />
      </>
    );
  } else if (minorKeyIndex >= 0) {
    return (
      <>
        <InnerSemiCircle
          opacity={0.6}
          backgroundColor={PRIMARY_COLOR}
          angleOffset={(minorKeyIndex + offset) * 30 - (90 - 15)}
        />
        <InnerSemiCircle
          opacity={1}
          backgroundColor={WHITE_COLOR}
          angleOffset={(minorKeyIndex + offset - 1) * 30 - (90 - 15)}
        />
      </>
    );
  }
  return null;
};

class CircleOfFifths extends Component<({ result?: string })> {
  render() {
    const offset = majorKeys.indexOf(keyAtTopPosition) * -1;
    return (
      <div
        style={{
          width: '1000px',
        }}
      >
        <div style={{position: 'relative' }}>
          {/* BACKGROUND */} 
          <div
            style={{
              position: 'absolute',
              borderRadius: `${BORDER_RADIUS}px`,
              border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
              height: `${BORDER_RADIUS * 2}px`,
              width: `${BORDER_RADIUS * 2}px`,
              left: `${HORIZONTAL_OFFSET - BORDER_RADIUS}px`,
              backgroundColor: `${WHITE_COLOR}`
            }}
          />
          <SemiCircleHighlight offset={offset} result={this.props.result} />
          {/* SEGMENT DIVIDERS */} 
          {majorKeys.map((major, index) => (
            <div
              style={{
                left: `${HORIZONTAL_OFFSET - BORDER_THICKNESS / 2}px`,
                width: `${BORDER_THICKNESS}px`,
                height: `${BORDER_RADIUS}px`,
                backgroundColor: `${BORDER_COLOR}`,
                transform: `rotate(${(index + offset) * 30 - 15}deg)`,
                transformOrigin: 'bottom center',
                position: 'absolute',
              }}
            />
          ))}
          {/* INNERMOST CIRCLE */} 
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
          {majorKeys.map((major, index) => (
            <div
              style={{
                top: `${BORDER_RADIUS - OUTER_RADIUS}px`,
                left: `${HORIZONTAL_OFFSET - MAJOR_NOTE_WIDTH / 2}px`,
                height: `${OUTER_RADIUS}px`,
                width: `${MAJOR_NOTE_WIDTH}px`,
                transform: `rotate(${(index + offset) * 30}deg)`,
                transformOrigin: 'bottom center',
                position: 'absolute',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  transform: `rotate(${-(index + offset) * 30}deg)`,
                  fontSize: keysNotation[major].length > 6 ? "0.6rem" : "1rem",
                  fontWeight: 'bold'
                }}
              >
                {keysNotation[major]}
              </div>
            </div>
          ))}
          {minorKeys.map((minor, index) => (
            <div
              style={{
                width: `${MINOR_NOTE_WIDTH}px`,
                top: `${(BORDER_RADIUS - INNER_RADIUS)}px`,
                left: `${HORIZONTAL_OFFSET - MINOR_NOTE_WIDTH / 2}px`,
                height: `${INNER_RADIUS}px`,
                transform: `rotate(${(index + offset) * 30}deg)`,
                transformOrigin: 'bottom center',
                position: 'absolute',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  transform: `rotate(${-(index + offset) * 30}deg)`,
                  fontSize: keysNotation[minor].length > 6 ? "0.6rem" : "0.8rem",
                }}
              >
                {keysNotation[minor]}
              </div>
            </div>
          ))}
          {/* OUTER BORDER */}  
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
          {/* INNER BORDER */} 
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
        </div>
      </div>
    );
  }
}

export default CircleOfFifths;
