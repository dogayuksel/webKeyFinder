import { h, Component } from 'preact';
import { Link, subscribers, getCurrentUrl } from 'preact-router';

import './Navigation.css';

class App extends Component {
	update = (url : string) => {
		this.setState({ updatedUrl: url });
	};

	componentDidMount() {
		subscribers.push(this.update);
	}

	componentWillUnmount() {
		subscribers.splice(subscribers.indexOf(this.update), 1);
	}

  render(_, { updatedUrl }) {
		let url = updatedUrl || getCurrentUrl();

    return (
      <nav class="navigation-wrapper">
        <Link href="/live" class={(url !== '/file' && url !== '/about') ? 'active' : ''}>Live Detection</Link>
        <Link href="/file" class={url === '/file' ? 'active' : ''} >File Analysis</Link>
        <Link href="/about" class={url === '/about' ? 'active' : ''}>About</Link>
      </nav>
    );
  }
}

export default App;
