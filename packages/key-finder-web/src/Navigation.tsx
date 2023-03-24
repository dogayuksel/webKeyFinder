import { h, Component } from 'preact';
import { Link } from 'preact-router/match';

import './Navigation.css';

interface State {
  updatedUrl: string;
  navOpen: boolean;
}

class App extends Component<{}, State> {
  closeNav = () => {
    const { navOpen } = this.state;
    if (navOpen === true) {
      this.setState({ navOpen: false });
    }
  };

  render(_, { navOpen }) {
    return (
      <nav
        class={['navigation-wrapper', navOpen ? 'navigation-open' : ''].join(
          ' '
        )}
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
