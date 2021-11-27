import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useState } from 'react';
import {
  isSafari,
  isIE,
  isSamsungBrowser,
  isLegacyEdge,
} from 'react-device-detect';

const App = () => {
  const [message, setMessage] = useState('');
  const [video, setVideo] = useState<File | null>();
  const [transcodedVideo, setTranscodedVideo] = useState('');

  const ffmpeg = createFFmpeg({
    log: true,
    corePath: 'ffmpeg-core.js',
  });

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setVideo(event.currentTarget.files[0]);
  };

  const doTranscode = async () => {
    setMessage('Loading ffmpeg-core.js');
    await ffmpeg.load();
    setMessage('Start transcoding, please wait this could take a while');
    ffmpeg.FS('writeFile', 'test.avi', await fetchFile(video));
    // needs fix here. videos get cut instead of transcoded to under 8mb
    await ffmpeg.run('-i', 'test.avi', '-fs', '7M', 'test.mp4');
    setMessage('');
    const data = ffmpeg.FS('readFile', 'test.mp4');
    setTranscodedVideo(
      URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
    );
  };

  if (isSafari || isIE || isSamsungBrowser || isLegacyEdge) {
    return (
      <div className='container'>
        <div className='section is-flex is-flex-direction-column'>
          <h1 className='title'>8 MB Video Converter</h1>
          <h2 className='subtitle'>
            100% privacy with client sided ffmpeg transcoding!
          </h2>
          <p className='has-text-danger'>
            Your Browser is not supported. Check{' '}
            <a href='https://caniuse.com/sharedarraybuffer'>here</a> for
            compatible browsers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='section is-flex is-flex-direction-column'>
        <h1 className='title'>8 MB Video Converter</h1>
        <h2 className='subtitle'>
          100% privacy with client sided ffmpeg transcoding!
        </h2>
        <div className='file is-link has-name is-fullwidth mb-4 '>
          <label className='file-label'>
            <input
              className='file-input'
              type='file'
              name='resume'
              onChange={handleChange}
            />
            <span className='file-cta'>
              <span className='file-label'>Choose a video</span>
            </span>
            <span className='file-name'>
              {video ? video.name : 'Nothing selected'}
            </span>
          </label>
        </div>

        {transcodedVideo && (
          <video src={transcodedVideo} controls className='mb-4' />
        )}

        {!transcodedVideo && video && video.type.includes('video') && (
          <button className='button is-link mb-4' onClick={doTranscode}>
            Start transcoding
          </button>
        )}

        {!transcodedVideo && video && !video.type.includes('video') && (
          <button
            className='button is-link mb-4'
            disabled
            onClick={doTranscode}
          >
            Unsupported file type
          </button>
        )}

        {!transcodedVideo && !video && (
          <button className='button is-link mb-4' disabled>
            Select a file
          </button>
        )}

        {transcodedVideo && (
          <button className='button is-success mb-4'>
            <a
              href={transcodedVideo}
              download
              style={{ textDecoration: 'none', color: 'white' }}
            >
              Download
            </a>
          </button>
        )}

        {transcodedVideo && (
          <button
            className='button is-danger mb-4'
            onClick={() => {
              setMessage('');
              setVideo(null);
              setTranscodedVideo('');
            }}
          >
            Reset
          </button>
        )}

        <p>{message}</p>
      </div>
    </div>
  );
};

export default App;
