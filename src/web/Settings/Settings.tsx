import { h, Fragment, Component } from 'preact';
import {
  majorKeys,
  minorKeys,
  keysNotation,
  theme,
  keyAtTopPosition,
  maxNumberOfThreads,
  numberOfThreads
} from '../defaults';

class Settings extends Component {
  state = {
    keysNotation,
    theme,
    keyAtTopPosition,
    numberOfThreads,
  }

  handleSave = e => {
    e.preventDefault();
    try {
      localStorage.setItem('customSettings', JSON.stringify(this.state));
      location.reload();
    } catch (e) {
      console.error('Can not use local storage', e);
    }
  }

  onInputNewNotation = e => {
    const { value, id } = e.target;
    this.setState({
      keysNotation: {
        ...this.state.keysNotation,
        [id]: value,
      }
    });
  }

  onInput = e => {
    const { value, id } = e.target;
    this.setState({
      [id]: value
    });
  }

  onChange = e => {
    this.setState({ keyAtTopPosition: e.target.value });
  }

  handleReset = () => {
    localStorage.clear();
    location.reload();
  }

  render() {
    return (
      <>
        <header>
          <h1>Settings</h1>
        </header>
        <main style={{ paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.6rem' }}>
            Custom settings are stored locally. Changed values as you desire and click on the save button at the end.
          </p>
          <form onSubmit={this.handleSave}>
            <h2>General</h2>
            <h3>Alternative Notation</h3>
            <p style={{ fontSize: '0.6rem' }}>
              Update default notation by modifying respective fields. Use following characters: a-z, A-Z, 0-9, ♭, ♯. No spaces in the beginning or the end.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '1em' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {majorKeys.map(major => (
                  <div style={{ display: 'flex', paddingBottom: '0.2rem' }}>
                    <label style={{ width: '5em' }}>{major}</label>
                    <input
                      onInput={this.onInputNewNotation}
                      style={{ width: '10em' }}
                      id={major}
                      value={this.state.keysNotation[major]}
                      pattern="[\w♭♯]|[\w♭♯][\w\s♭♯]*[\w♭♯]"
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {minorKeys.map(minor => (
                  <div style={{ display: 'flex', paddingBottom: '0.2rem' }}>
                    <label style={{ width: '5em' }}>{minor}</label>
                    <input
                      onInput={this.onInputNewNotation}
                      style={{ width: '10em' }}
                      id={minor}
                      value={this.state.keysNotation[minor]}
                      pattern="[\w♭♯]|[\w♭♯][\w\s♭♯]*[\w♭♯]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <h3>Theme</h3>
            <p>Under construction</p>
            <div>
              <div style={{ display: 'inline-block', paddingRight: '1em' }}>
                <input
                  type="radio"
                  id="light"
                  name="theme"
                  value="light"
                  checked={this.state.theme === 'light'}
                />
                <label for="light">light</label>
              </div>
              <div style={{ display: 'inline-block', opacity: '0.5' }}>
                <input
                  type="radio"
                  id="dark"
                  name="theme"
                  value="dark" 
                  checked={this.state.theme === 'dark'}
                  disabled />
                <label for="dark">dark</label>
              </div>
            </div>
            <h2>Live Detection</h2>
            <p style={{ fontSize: '0.6rem' }}>
              Some notations orient circle of fifths differently. Select the note in the 12 o'clock position to adjust how circle of fifths is visualized.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <label
                for="keyAtTopPosition"
                style={{ paddingRight: '1em' }}
              >
                <h3>Key at top position</h3>
              </label>
              <select
                name="keyAtTopPosition"
                id="keyAtTopPosition"
                onChange={this.onChange}
              >
                <>
                  {majorKeys.map(key => (
                    <option
                      value={key}
                      selected={this.state.keyAtTopPosition === key}
                    >
                      {key}
                    </option>
                  ))}
                </>
              </select>
            </div>
            <h2>File Analysis</h2>
            <p style={{ fontSize: '0.6rem' }}>
              While analyzing files, the application spawns multiple workers. Set the maximum number of workers to be run at the same time.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <label
                for="numberOfThreads"
                style={{ paddingRight: '1em' }}
              >
                <h3>Parallel Processes</h3>
              </label>
              <input
                type="number"
                id="numberOfThreads"
                name="numberOfThreads"
                min="1"
                max={maxNumberOfThreads}
                onInput={this.onInput}
                value={this.state.numberOfThreads}
              />
            </div>
            <button type="submit">SAVE</button>
          </form>
          <div style={{ marginTop: '8em' }}>
            <h3 style={{ color: 'red' }}>DANGER</h3>
            <button onClick={this.handleReset}>delete custom settings</button>
          </div>
        </main>
      </>
    );
  }
}

export default Settings;
