import { h, render, Fragment, Component } from 'preact';
import LiveDetection from './LiveDetection';
import AudioFileKeyDetection from './AudioFileKeyDetection';

class App extends Component {
  render() {
    return (
      <>
        <LiveDetection />
        <AudioFileKeyDetection />
      </>
    );
  }
}

render(<App />, document.body);
