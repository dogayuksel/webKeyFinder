import { h, Fragment, Component } from 'preact';
import { Router, Link } from 'preact-router';
import LiveDetection from './LiveDetection';
import AudioFileKeyDetection from './AudioFileKeyDetection';
import About from './About';

import './App.css';

class App extends Component {
  render() {
    return (
      <>
        <nav class="navigation-wrapper">
          <Link href="/live">LiveDetection</Link>
          <Link href="/file">Audio File Analysis</Link>
          <Link href="/about">About</Link>
        </nav>
        <div class="app-wrapper">
          <Router>
            <LiveDetection default />
            <AudioFileKeyDetection path="/file" />
            <About path="/about" />
          </Router>
        </div>
      </>
    );
  }
}

export default App;
