import { h } from 'preact';
import { useState, useRef, useMemo } from 'preact/hooks';

const knobSensitivityFactor = 4;
const sizeInPixels = (x: number) => `${x}px`;

// Range of degrees displayed
const knobMin = 30.0;
const knobMax = 330.0;

type KnobScale = 'Linear' | 'Logarithmic';

interface KnobConfig {
  minValue: number;
  maxValue: number;
  scale: KnobScale;
  size: number;
}

const clamp = (value: number, config: KnobConfig): number => {
  if (value < config.minValue) return config.minValue;
  if (value > config.maxValue) return config.maxValue;
  return value;
};

const mapValue = (
  from: [number, number],
  target: [number, number],
  value: number
): number => {
  const [xmin, xmax] = from;
  const [ymin, ymax] = target;
  return ((value - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;
};

interface KnobProps {
  name: string;
  config: KnobConfig;
  initialParamValue: number;
  setParamValue: (value: number) => void;
}

const Knob = ({
  name,
  config,
  initialParamValue,
  setParamValue,
}: KnobProps) => {
  const knobDomainInPixels = useMemo(
    () => config.size * knobSensitivityFactor,
    [config.size]
  );

  const mapParam = (value: number) =>
    mapValue([config.minValue, config.maxValue], [knobMin, knobMax], value);
  const mapToParam = (value: number) =>
    mapValue([knobMin, knobMax], [config.minValue, config.maxValue], value);
  const mapToDegrees = (value: number) =>
    mapValue([0, 1], [knobMin, knobMax], value);

  const indicatorPrecision = useMemo(() => {
    const logRange = Math.log10(config.maxValue - config.minValue);
    if (logRange > 3.0) return 0;
    if (logRange > 0.8) return 1;
    return 2;
  }, [config.minValue, config.maxValue]);

  const mapValueToDegrees = (value: number): string => {
    let degrees;
    if (config.scale === 'Linear') {
      degrees = mapParam(value);
    } else {
      degrees = mapToDegrees(Math.log10(mapParam(value)));
    }
    return `${degrees}deg`;
  };

  const [value, setValue] = useState(initialParamValue);
  const lastY = useRef(0);

  const handleMove = (clientY: number) => {
    setValue((prevValue) => {
      const change = mapValue(
        [0, knobDomainInPixels],
        [0, 1],
        lastY.current - clientY
      );
      let newValue;
      if (config.scale === 'Linear') {
        newValue = mapToParam(mapValue([0, 1], [0, 1], prevValue) + change);
      } else {
        newValue = mapToParam(
          Math.pow(
            10,
            Math.log10(mapValue([0, 1], [1, 10], prevValue)) + change
          )
        );
      }
      const clampedValue = clamp(newValue, config);
      setParamValue(clampedValue);
      lastY.current = clientY;
      return clampedValue;
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    handleMove(event.clientY);
  };

  const handleTouchMove = (event: TouchEvent) => {
    handleMove(event.touches[0].clientY);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleMouseDown = (event: MouseEvent) => {
    lastY.current = event.clientY;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (event: TouchEvent) => {
    lastY.current = event.touches[0].clientY;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleDoubleClick = () => {
    const resetValue = 1;
    setValue(resetValue);
    setParamValue(resetValue);
  };

  return (
    <div
      style={{ width: sizeInPixels(config.size + 50) }}
      className="control-container"
    >
      <h4 className="control-label">{name}</h4>
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDblClick={handleDoubleClick}
        style={{
          backgroundColor: 'silver',
          width: sizeInPixels(config.size),
          height: sizeInPixels(config.size),
          margin: '0 auto',
          borderRadius: sizeInPixels(config.size),
          border: '1px solid white',
          display: 'flex',
          justifyContent: 'center',
          transform: `rotate(${mapValueToDegrees(value)})`,
        }}
      >
        <div
          style={{
            width: '0',
            height: '0',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '12px solid black',
          }}
        />
      </div>
      <h4 className="control-label">{value.toFixed(indicatorPrecision)}</h4>
    </div>
  );
};

export default Knob;
