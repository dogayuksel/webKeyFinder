import { jsxs, jsx } from 'preact/jsx-runtime';
import { useMemo, useState, useRef } from 'preact/hooks';

var knobSensitivityFactor = 4;
var sizeInPixels = function (x) {
  return ''.concat(x, 'px');
};
// Range of degrees displayed
var knobMin = 30.0;
var knobMax = 330.0;
var clamp = function (value, config) {
  if (value < config.minValue) return config.minValue;
  if (value > config.maxValue) return config.maxValue;
  return value;
};
var mapValue = function (from, target, value) {
  var xmin = from[0],
    xmax = from[1];
  var ymin = target[0],
    ymax = target[1];
  return ((value - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;
};
var Knob = function (_a) {
  var name = _a.name,
    config = _a.config,
    initialParamValue = _a.initialParamValue,
    setParamValue = _a.setParamValue;
  var knobDomainInPixels = useMemo(
    function () {
      return config.size * knobSensitivityFactor;
    },
    [config.size]
  );
  var mapParam = function (value) {
    return mapValue(
      [config.minValue, config.maxValue],
      [knobMin, knobMax],
      value
    );
  };
  var mapToParam = function (value) {
    return mapValue(
      [knobMin, knobMax],
      [config.minValue, config.maxValue],
      value
    );
  };
  var mapToDegrees = function (value) {
    return mapValue([0, 1], [knobMin, knobMax], value);
  };
  var indicatorPrecision = useMemo(
    function () {
      var logRange = Math.log10(config.maxValue - config.minValue);
      if (logRange > 3.0) return 0;
      if (logRange > 0.8) return 1;
      return 2;
    },
    [config.minValue, config.maxValue]
  );
  var mapValueToDegrees = function (value) {
    var degrees;
    if (config.scale === 'Linear') {
      degrees = mapParam(value);
    } else {
      degrees = mapToDegrees(Math.log10(mapParam(value)));
    }
    return ''.concat(degrees, 'deg');
  };
  var _b = useState(initialParamValue),
    value = _b[0],
    setValue = _b[1];
  var lastY = useRef(0);
  var handleMove = function (clientY) {
    setValue(function (prevValue) {
      var change = mapValue(
        [0, knobDomainInPixels],
        [0, 1],
        lastY.current - clientY
      );
      var newValue;
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
      var clampedValue = clamp(newValue, config);
      setParamValue(clampedValue);
      lastY.current = clientY;
      return clampedValue;
    });
  };
  var handleMouseMove = function (event) {
    handleMove(event.clientY);
  };
  var handleTouchMove = function (event) {
    handleMove(event.touches[0].clientY);
  };
  var handleMouseUp = function () {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  var handleTouchEnd = function () {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  var handleMouseDown = function (event) {
    lastY.current = event.clientY;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  var handleTouchStart = function (event) {
    lastY.current = event.touches[0].clientY;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };
  var handleDoubleClick = function () {
    var resetValue = 1;
    setValue(resetValue);
    setParamValue(resetValue);
  };
  return jsxs('div', {
    style: { width: sizeInPixels(config.size + 50) },
    className: 'control-container',
    children: [
      jsx('h4', { className: 'control-label', children: name }),
      jsx('div', {
        onMouseDown: handleMouseDown,
        onTouchStart: handleTouchStart,
        onDblClick: handleDoubleClick,
        style: {
          backgroundColor: 'silver',
          width: sizeInPixels(config.size),
          height: sizeInPixels(config.size),
          margin: '0 auto',
          borderRadius: sizeInPixels(config.size),
          border: '1px solid white',
          display: 'flex',
          justifyContent: 'center',
          transform: 'rotate('.concat(mapValueToDegrees(value), ')'),
        },
        children: jsx('div', {
          style: {
            width: '0',
            height: '0',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '12px solid black',
          },
        }),
      }),
      jsx('h4', {
        className: 'control-label',
        children: value.toFixed(indicatorPrecision),
      }),
    ],
  });
};

export { Knob as default };
