import { h, render, Fragment, Component } from 'preact';

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

class Footer extends Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div>More info about the project at <ProjectInfoLink />.</div>
        <div style={{ marginTop: '0.2em' }}>Source code is available at <GithubLink />.</div>
        <div style={{ marginTop: '0.2em' }}>If you don't have a github account, shoot me an email at <EmailAddress /> to request it.</div>
      </div>
    );
  }
}

export default Footer;
