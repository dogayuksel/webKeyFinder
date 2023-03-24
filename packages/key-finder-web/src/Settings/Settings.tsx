import { h, Fragment, Component } from 'preact';
import {
  majorKeys,
  minorKeys,
  keysNotation,
  theme as themeValue,
  keyAtTopPosition,
  maxNumberOfThreads,
  numberOfThreads,
} from '../defaults';

import './Settings.css';

class Settings extends Component {
  state = {
    keysNotation,
    theme: themeValue,
    keyAtTopPosition,
    numberOfThreads,
  };

  componentDidMount() {
    document.title = 'keyfinder | Settings for Key Finder Application';
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        'content',
        'Adjust the settings for the musical key finder application. You can modify the notation used to visualize the circle of fifths.'
      );
  }

  handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('customSettings', JSON.stringify(this.state));
      location.reload();
    } catch (e) {
      console.error('Can not use local storage', e);
    }
  };

  onInputNewNotation = (e) => {
    const { value, id } = e.target;
    this.setState({
      keysNotation: {
        ...this.state.keysNotation,
        [id]: value,
      },
    });
  };

  onInput = (e) => {
    const { value, id } = e.target;
    this.setState({
      [id]: value,
    });
  };

  onChange = (e) => {
    const { value, name } = e.target;
    this.setState({ [name]: value });
  };

  handleReset = () => {
    localStorage.clear();
    location.reload();
  };

  render() {
    return (
      <main class="settings-page">
        <header>
          <h1>Settings</h1>
        </header>
        <div class="settings-container">
          <p>
            {
              'Custom settings are stored locally. Change values as you desire and click on the save button at the bottom.'
            }
          </p>
          <form onSubmit={this.handleSave}>
            <h2>General</h2>
            <h3>Alternative Notation</h3>
            <p>
              {
                'Update default notation by modifying respective fields. Use following characters: a-z, A-Z, 0-9, ♭, ♯. No spaces in the beginning or the end.'
              }
            </p>
            <div class="settings-container__notation-fields">
              <div class="settings-container__notation-fields-column">
                {majorKeys.map((major) => (
                  <div class="settings-container__notation-field">
                    <label for={major}>{major}</label>
                    <input
                      onInput={this.onInputNewNotation}
                      id={major}
                      value={this.state.keysNotation[major]}
                      pattern="[\w♭♯]|[\w♭♯][\w\s♭♯]*[\w♭♯]"
                    />
                  </div>
                ))}
              </div>
              <div class="settings-container__notation-fields-column">
                {minorKeys.map((minor) => (
                  <div class="settings-container__notation-field">
                    <label for={minor}>{minor}</label>
                    <input
                      onInput={this.onInputNewNotation}
                      id={minor}
                      value={this.state.keysNotation[minor]}
                      pattern="[\w♭♯]|[\w♭♯][\w\s♭♯]*[\w♭♯]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <h3>Theme</h3>
            <div class="settings-container__theme-fields">
              <div>
                <input
                  type="radio"
                  id="light"
                  name="theme"
                  value="light"
                  onChange={this.onChange}
                  checked={this.state.theme === 'light'}
                />
                <label for="light">light</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="dark"
                  name="theme"
                  value="dark"
                  onChange={this.onChange}
                  checked={this.state.theme === 'dark'}
                />
                <label for="dark">dark</label>
              </div>
            </div>
            <h2>Live Detection</h2>
            <p>
              {
                "Some notations orient circle of fifths differently. Select the note in the 12 o'clock position to adjust how circle of fifths is visualized."
              }
            </p>
            <div class="settings-container__key-at-top-field">
              <label for="keyAtTopPosition">
                <h3>Key at top position</h3>
              </label>
              <select
                name="keyAtTopPosition"
                id="keyAtTopPosition"
                onChange={this.onChange}
              >
                <>
                  {majorKeys.map((key) => (
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
            <p>
              {
                'While analyzing files, the application spawns multiple workers. Set the maximum number of workers to be run at the same time.'
              }
            </p>
            <div class="settings-container__processes-field">
              <label for="numberOfThreads">
                <h3>Parallel Processes</h3>
              </label>
              <input
                type="number"
                id="numberOfThreads"
                name="numberOfThreads"
                min="1"
                onInput={this.onInput}
                value={this.state.numberOfThreads}
              />
            </div>
            {this.state.numberOfThreads > maxNumberOfThreads && (
              <p class="settings-container--danger">
                {`According to your browser, your machine has ${maxNumberOfThreads} processors available. Spawing more threads than that will slow down your computer.`}
              </p>
            )}
            <button class="settings-container__save-button" type="submit">
              SAVE
            </button>
          </form>
          <div class="settings-container__reset-section">
            <h3 class="settings-container--danger">DANGER</h3>
            <button onClick={this.handleReset}>delete custom settings</button>
          </div>
        </div>
      </main>
    );
  }
}

export default Settings;
