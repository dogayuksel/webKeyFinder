import { createRef, h, Fragment, Component } from 'preact';
import { Link } from 'preact-router';
import AudioFileItem, { FileItem } from './AudioFileItem'
import { v4 as uuidv4 } from 'uuid';
import { numberOfThreads } from '../defaults';

interface State {
  files: Array<FileItem>,
};

class AudioFileKeyDetection extends Component<{}, State> {
  ref = createRef();
  state: State = {
    files: [],
  };

  handleFileInput = ({ target }: Event): void => {
    const fileList = (target as HTMLInputElement).files;
    this.setState(({ files }) => {
      let availableThreads = files.reduce((acc, cur) => {
        if (cur.canProcess && !cur.result)
          return acc - 1;
        return acc;
      }, numberOfThreads);
      for (let fileIdx = 0; fileIdx < fileList.length; fileIdx += 1) {
        let canProcess = false;
        if (availableThreads > 0) {
          canProcess = true;
          availableThreads -= 1;
        }
        const id = uuidv4();
        files.push({
          id,
          canProcess,
          file: fileList[fileIdx],
          result: null,
          digest: null,
        });
      }
      this.ref.current.value = null;
      return ({ files });
    });
  }

  updateDigest = (uuid: string, digest: string): void => {
    this.setState(({ files }) => {
      const newFiles = files.map(file => {
        if (file.id === uuid)
          return ({ ...file, uuid });
        return file;
      });
      return ({ files: newFiles });
    });
  }

  updateResult = (uuid: string, result: string): void => {
    this.setState(({ files }) => {
      let availableThreads = 1;
      const newFiles = files.map(file => {
        if (file.id === uuid)
          return ({ ...file, result });
        if (file.canProcess === false && availableThreads > 0) {
          availableThreads -= 1;
          return ({ ...file, canProcess: true });
        }
        return file;
      });
      return ({ files: newFiles });
    });
  }

  render ({}, { files }) {
    return (
      <>
        <header>
          <h1>Audio File Key Detection</h1>
        </header>
        <main style={{ paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.6rem' }}>
            {numberOfThreads === 1
             ? 'No parallel processes. '
             : `Using ${numberOfThreads} parallel processes. `}
            <Link href="/settings">[settings]</Link>
          </p>
          <div style={{ paddingBottom: '1.5rem' }}>
            <label for="load-a-track" style={{ paddingRight: '1rem' }}>Load a track: </label>
            <input
              ref={this.ref}
              id="load-a-track"
              type="file"
              accept="audio/*"
              multiple={true}
              onInput={this.handleFileInput}
            />
          </div>
          {files.map(fileItem => (
            <AudioFileItem
              key={fileItem.id}
              fileItem={fileItem}
              updateDigest={this.updateDigest}
              updateResult={this.updateResult}
            />
          ))}
        </main>
      </>
    );
  }
}

export default AudioFileKeyDetection;
