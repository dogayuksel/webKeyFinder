import { h, Fragment, Component } from 'preact';
import {
  majorKeys,
  minorKeys,
  keysNotation,
  keyAtTopPosition,
} from './defaults';
import theme from './theme';

const BORDER_THICKNESS = 2;
const BORDER_COLOR = theme.colors['--gray-color'];
const HIGHLIGHT_COLOR = theme.colors['--secondary-color'];
const WHITE_COLOR = theme.colors['--background-color'];

const INNERMOST_RATIO = 0.35;
const MINOR_RATIO = 0.49;
const INNER_RATIO = 0.67;
const MAJOR_RATIO = 0.82;

const InnerSemiCircle = ({ backgroundColor, angleOffset, opacity }) => (
  <div
    style={{
      position: 'absolute',
      transform: `rotate(${angleOffset}deg)`,
      transformOrigin: 'bottom center',
      height: `${INNER_RATIO * 50}%`,
      width: `${INNER_RATIO * 100}%`,
      top: `${(1 - INNER_RATIO) * 50}%`,
      left: `${(1 - INNER_RATIO) * 50}%`,
      borderTopLeftRadius: `${INNER_RATIO * 100}% ${INNER_RATIO * 200}%`,
      borderTopRightRadius: `${INNER_RATIO * 100}% ${INNER_RATIO * 200}%`,
      backgroundColor: backgroundColor,
      opacity: opacity,
    }}
  />
);

const OuterSemiCircle = ({ backgroundColor, angleOffset, opacity }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      transform: `rotate(${angleOffset}deg)`,
      transformOrigin: 'bottom center',
      height: '50%',
      width: '100%',
      borderTopLeftRadius: '100% 200%',
      borderTopRightRadius: '100% 200%',
      backgroundColor: backgroundColor,
      opacity: opacity,
    }}
  />
);

const SemiCircleHighlight = ({ result, offset }) => {
  const majorKeyIndex = majorKeys.findIndex((key) => key === result);
  const minorKeyIndex = minorKeys.findIndex((key) => key === result);

  if (majorKeyIndex >= 0) {
    return (
      <>
        <OuterSemiCircle
          opacity={0.6}
          backgroundColor={HIGHLIGHT_COLOR}
          angleOffset={(majorKeyIndex + offset) * 30 - (90 - 15)}
        />
        <OuterSemiCircle
          opacity={1}
          backgroundColor={WHITE_COLOR}
          angleOffset={(majorKeyIndex + offset - 1) * 30 - (90 - 15)}
        />
        {/* refill minor section background */}
        <div
          style={{
            position: 'absolute',
            height: `${INNER_RATIO * 100}%`,
            width: `${INNER_RATIO * 100}%`,
            top: `${(1 - INNER_RATIO) * 50}%`,
            left: `${(1 - INNER_RATIO) * 50}%`,
            borderRadius: '50%',
            backgroundColor: `${WHITE_COLOR}`,
          }}
        />
      </>
    );
  } else if (minorKeyIndex >= 0) {
    return (
      <>
        <InnerSemiCircle
          opacity={0.6}
          backgroundColor={HIGHLIGHT_COLOR}
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

class CircleOfFifths extends Component<{
  result?: string;
  mini?: boolean;
}> {
  static defaultProps = {
    mini: false,
  };

  render() {
    const offset = majorKeys.indexOf(keyAtTopPosition) * -1;
    return (
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
        {/* BACKGROUND */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            borderRadius: '50%',
            border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
            height: '100%',
            width: '100%',
            backgroundColor: `${WHITE_COLOR}`,
          }}
        />
        <SemiCircleHighlight offset={offset} result={this.props.result} />
        {/* SEGMENT DIVIDERS */}
        {majorKeys.map((_, index) => (
          <div
            style={{
              top: 0,
              left: `calc(50% - ${BORDER_THICKNESS / 2}px)`,
              width: `${BORDER_THICKNESS}px`,
              height: '50%',
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
            borderRadius: '100%',
            border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
            height: `${INNERMOST_RATIO * 100}%`,
            width: `${INNERMOST_RATIO * 100}%`,
            top: `${(1 - INNERMOST_RATIO) * 50}%`,
            left: `${(1 - INNERMOST_RATIO) * 50}%`,
            backgroundColor: `${WHITE_COLOR}`,
          }}
        />
        {!this.props.mini &&
          majorKeys.map((major, index) => (
            <div
              style={{
                top: `${(1 - MAJOR_RATIO) * 50}%`,
                left: '50%',
                height: `${MAJOR_RATIO * 50}%`,
                width: '0',
                transform: `rotate(${(index + offset) * 30}deg)`,
                transformOrigin: 'bottom center',
                position: 'absolute',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  left: '-1.5rem',
                  top: '-1.5rem',
                  width: '3rem',
                  height: '3rem',
                  textAlign: 'center',
                  transform: `rotate(${-(index + offset) * 30}deg)`,
                  fontSize: `${
                    1.1 - Math.sqrt(keysNotation[major].length) * 0.1
                  }rem`,
                  fontWeight: 'bold',
                }}
              >
                {keysNotation[major]}
              </div>
            </div>
          ))}
        {!this.props.mini &&
          minorKeys.map((minor, index) => (
            <div
              style={{
                top: `${(1 - MINOR_RATIO) * 50}%`,
                left: '50%',
                height: `${MINOR_RATIO * 50}%`,
                width: '0',
                transform: `rotate(${(index + offset) * 30}deg)`,
                transformOrigin: 'bottom center',
                position: 'absolute',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  left: '-1rem',
                  top: '-1rem',
                  width: '2rem',
                  height: '2rem',
                  textAlign: 'center',
                  transform: `rotate(${-(index + offset) * 30}deg)`,
                  fontSize: `${
                    0.9 - Math.sqrt(keysNotation[minor].length) * 0.1
                  }rem`,
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
            top: 0,
            borderRadius: '50%',
            border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
            height: `100%`,
            width: `100%`,
          }}
        />
        {/* INNER BORDER */}
        <div
          style={{
            position: 'absolute',
            borderRadius: '100%',
            border: `${BORDER_THICKNESS}px solid ${BORDER_COLOR}`,
            height: `${INNER_RATIO * 100}%`,
            width: `${INNER_RATIO * 100}%`,
            top: `${(1 - INNER_RATIO) * 50}%`,
            left: `${(1 - INNER_RATIO) * 50}%`,
          }}
        />
      </div>
    );
  }
}

export default CircleOfFifths;
