import classNames from 'classnames';
import { Component } from 'preact';
import { Link } from 'preact-router/match';

import './Navigation.css';

interface State {
  navOpen: boolean;
}

class App extends Component<{}, State> {
  constructor() {
    super();
    this.state = { navOpen: false };
  }

  closeNav = () => {
    const { navOpen } = this.state;
    if (navOpen === true) {
      this.setState({ navOpen: false });
    }
  };

  render() {
    const { navOpen } = this.state;
    return (
      <nav
        class={classNames('navigation-wrapper', { 'navigation-open': navOpen })}
      >
        <button onClick={() => this.setState({ navOpen: true })}>☰</button>
        <div class="links-container">
          <Link href="/live" activeClassName="active" onClick={this.closeNav}>
            Live Detection
          </Link>
          <Link href="/file" activeClassName="active" onClick={this.closeNav}>
            File Analysis
          </Link>
          <Link
            href="/settings"
            activeClassName="active"
            onClick={this.closeNav}
          >
            Settings
          </Link>
          <Link href="/about" activeClassName="active" onClick={this.closeNav}>
            About
          </Link>
        </div>
      </nav>
    );
  }
}

export default App;
