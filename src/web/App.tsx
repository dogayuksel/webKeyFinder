import { h, Fragment, Component } from 'preact';
import LiveDetection from './LiveDetection';
import AudioFileKeyDetection from './AudioFileKeyDetection';
import Footer from './Footer';

import './App.css';

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

export default App;
