import { h, Fragment, Component } from 'preact';

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
    github/dogayuksel/webKeyFinder
  </a>
);
const EmailAddress = () => (<a href="mailto:hello@doga.dev">hello[at]doga.dev</a>);

class About extends Component {
  render() {
    return (
      <>
        <header>
          <h1>About</h1>
        </header>
        <main style={{ paddingTop: '1rem' }}>
          <p>More info about the project at <ProjectInfoLink />.</p>
          <p>Source code is available at <GithubLink />.</p>
          <p>If you do not have a github account, shoot me an email at <EmailAddress /> to request it.</p>
        </main>
      </>
    );
  }
}

export default About;
