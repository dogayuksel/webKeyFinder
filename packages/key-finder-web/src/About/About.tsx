import { h, Fragment, Component } from 'preact';

import './About.css';

const ProjectInfoLink = () => (
  <a
    href="https://doga.dev/projects/web-key-finder"
    target="_blank"
    rel="noopener noreferrer"
  >
    doga.dev/web-key-finder
  </a>
);
const GithubLink = () => (
  <a
    href="https://github.com/dogayuksel/webKeyFinder"
    target="_blank"
    rel="noopener noreferrer"
  >
    github
  </a>
);
const EmailAddress = () => (
  <a href="mailto:hello@doga.dev">hello[at]doga.dev</a>
);

class About extends Component {
  componentDidMount() {
    document.title = 'keyfinder | More about the Key Finder Application';
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        'content',
        'Find out more about how the Key Finder Application application works. Access the source code to run it yourself.'
      );
  }

  render() {
    return (
      <main class="about-page">
        <header>
          <h1>About</h1>
        </header>
        <div class="about-page__links">
          <p>
            More info about the project at <ProjectInfoLink />.
          </p>
          <p>
            Source code is available on <GithubLink />.
          </p>
          <p>
            If you do not have a github account, shoot me an email at{' '}
            <EmailAddress /> to request it.
          </p>
        </div>
      </main>
    );
  }
}

export default About;
