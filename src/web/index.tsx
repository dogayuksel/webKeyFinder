import { h, render, Fragment, Component } from 'preact';
import LiveDetection from './LiveDetection';
import AudioFileKeyDetection from './AudioFileKeyDetection';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <>
        <LiveDetection />
        <AudioFileKeyDetection />
        <Footer />
      </>
    );
  }
}

render(<App />, document.body);
