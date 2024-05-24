import { FunctionalComponent, h, JSX } from 'preact';
import './GainControl.css';

interface GainControlProps {
  gain: number;
  updateGain: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => void;
  resetGain: () => void;
}

const GainControl: FunctionalComponent<GainControlProps> = ({
  gain,
  updateGain,
  resetGain,
}) => {
  const formattedGain = gain === 0 ? '0.00' : (10 ** gain).toFixed(2);
  const sign = gain >= 0 ? '+' : '-';

  return (
    <div className="gain-input">
      <label htmlFor="gain">
        Gain <br /> {sign}
        {formattedGain}
      </label>
      <input
        className="range-input"
        type="range"
        name="gain"
        id="gain"
        min="-1"
        max="1"
        step={0.02}
        value={gain}
        onChange={updateGain}
        disabled={false}
      />
      <button className="gain-reset" onClick={resetGain}>
        Reset
      </button>
    </div>
  );
};

export default GainControl;
