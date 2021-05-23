import { h, Component } from 'preact';
import { Link, subscribers, getCurrentUrl } from 'preact-router';

import './Navigation.css';

interface State {
  updatedUrl: string,
  navOpen: boolean,
}

class App extends Component<{}, State> {
	update = (url : string) => {
		this.setState({ updatedUrl: url });
	};

	componentDidMount() {
		subscribers.push(this.update);
	}

	componentWillUnmount() {
		subscribers.splice(subscribers.indexOf(this.update), 1);
	}

  closeNav = () => {
    const { navOpen } = this.state;
    if (navOpen === true) {
      this.setState({ navOpen: false });
    }
  }

  render(_, { updatedUrl, navOpen }) {
		let url = updatedUrl || getCurrentUrl();

    return (
      <nav class={["navigation-wrapper", navOpen ? "navigation-open" : ""].join(" ")}>
        <button onClick={() => this.setState({ navOpen: true })}>☰</button>
        <div
          class="links-container"
        >
          <Link
            href="/live"
            class={!['/file', '/about', '/settings'].includes(url) ? 'active' : ''}
            onClick={this.closeNav}
          >
            Live Detection
          </Link>
          <Link
            href="/file"
            class={url === '/file' ? 'active' : ''}
            onClick={this.closeNav}
          >
            File Analysis
          </Link>
          <Link
            href="/settings"
            class={url === '/settings' ? 'active' : ''}
            onClick={this.closeNav}
          >
            Settings
          </Link>
          <Link
            href="/about"
            class={url === '/about' ? 'active' : ''}
            onClick={this.closeNav}
          >
            About
          </Link>
        </div>
      </nav>
    );
  }
}

export default App;
