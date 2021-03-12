import { h, Fragment, Component } from 'preact';
import { Router, Link } from 'preact-router';
import Navigation from './Navigation';
import LiveDetection from './LiveDetection';
import AudioFileKeyDetection from './AudioFileKeyDetection';
import Settings from './Settings';
import About from './About';

import './App.css';

class App extends Component {
  render() {
    return (
      <>
        <div class="top-bar">
          <div class="app-logo">
            <Link href="/">key-finder</Link>
          </div>
          <Navigation />
        </div>
        <div class="app-wrapper">
          <Router>
            <LiveDetection default />
            <AudioFileKeyDetection path="/file" />
            <Settings path="/settings" />
            <About path="/about" />
          </Router>
        </div>
      </>
    );
  }
}

export default App;
